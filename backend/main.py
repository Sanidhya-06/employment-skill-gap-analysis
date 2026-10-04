from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field, model_validator
from sklearn.preprocessing import StandardScaler


ROOT_DIR = Path(__file__).resolve().parent.parent
ML_DIR = ROOT_DIR / "ML"
MODEL_DIR = ML_DIR / "models"
FEATURES_PATH = ML_DIR / "data" / "processed" / "features_dataset.csv"

LOGISTIC_FEATURES = [
    "years_experience",
    "certifications_count",
    "profile_completeness_pct",
    "log_endorsements",
    "skill_count",
    "education_ord",
    "update_ord",
    "connections_ord",
    "in_demand_skill_flag_bin",
    "open_to_work_bin",
    "uses_generative_ai_tools_bin",
    "work_mode",
]
LINEAR_FEATURES = [
    "years_experience",
    "seniority_ord",
    "certifications_count",
    "profile_completeness_pct",
    "log_endorsements",
    "skill_count",
    "education_ord",
    "update_ord",
    "connections_ord",
    "in_demand_skill_flag_bin",
    "open_to_work_bin",
    "uses_generative_ai_tools_bin",
    "work_mode",
]
KMEANS_FEATURES = [
    "years_experience",
    "log_salary",
    "employability_score",
    "certifications_count",
    "education_ord",
    "in_demand_skill_flag_bin",
    "uses_generative_ai_tools_bin",
]

WORK_MODES = ("On-site", "Hybrid", "Remote")
SENIORITY_ORD = {
    "Entry-level": 0,
    "Associate": 1,
    "Mid-Senior": 2,
    "Senior": 3,
    "Lead/Principal": 4,
    "Director+": 5,
}
EDUCATION_ORD = {
    "Bootcamp/Certification-only": 0,
    "Diploma": 1,
    "Bachelor's": 2,
    "Master's": 3,
    "PhD": 4,
}
UPDATE_ORD = {
    "6+ months ago": 0,
    "3-6 months ago": 1,
    "1-3 months ago": 2,
    "This month": 3,
    "This week": 4,
}
CONNECTIONS_ORD = {"<50": 0, "50-150": 1, "150-500": 2, "500+": 3, "1000+": 4}


class ProfileInput(BaseModel):
    """Raw profile facts; notebook-derived feature columns are built below."""

    model_config = ConfigDict(extra="forbid")

    years_experience: float = Field(ge=0, le=80)
    seniority_level: Literal[
        "Entry-level", "Associate", "Mid-Senior", "Senior", "Lead/Principal", "Director+"
    ]
    certifications_count: float = Field(ge=0, le=1000)
    profile_completeness_pct: float = Field(ge=0, le=100)
    endorsement_count: float = Field(ge=0, le=10_000_000)
    skill_count: int = Field(ge=0, le=10_000)
    education_level: Literal[
        "Bootcamp/Certification-only", "Diploma", "Bachelor's", "Master's", "PhD"
    ]
    last_profile_update: Literal[
        "6+ months ago", "3-6 months ago", "1-3 months ago", "This month", "This week"
    ]
    connections_tier: Literal["<50", "50-150", "150-500", "500+", "1000+"]
    in_demand_skill_flag: bool
    open_to_work: bool
    uses_generative_ai_tools: bool
    work_mode: Literal["On-site", "Hybrid", "Remote"]
    estimated_annual_salary_lpa: float = Field(gt=0, le=100_000)

    @model_validator(mode="after")
    def validate_profile(self) -> "ProfileInput":
        return self


@lru_cache(maxsize=1)
def load_models():
    """Load only the existing serialized estimators; preprocessing stays as trained."""
    paths = {
        "logistic": MODEL_DIR / "logistic_model.pkl",
        "linear": MODEL_DIR / "linear_model.pkl",
        "kmeans": MODEL_DIR / "kmeans_model.pkl",
    }
    missing = [str(path) for path in paths.values() if not path.is_file()]
    if missing:
        raise RuntimeError(f"Required model artifact(s) not found: {', '.join(missing)}")
    return {name: joblib.load(path) for name, path in paths.items()}


@lru_cache(maxsize=1)
def load_kmeans_scaler() -> StandardScaler:
    """Recreate the notebook's fitted scaler from its exact training feature matrix.

    The notebook fitted StandardScaler on these columns before KMeans but saved only
    the KMeans estimator. Re-fitting on the same processed training data reproduces
    the transform expected by the persisted cluster centers.
    """
    if not FEATURES_PATH.is_file():
        raise RuntimeError(f"K-Means training feature data not found: {FEATURES_PATH}")
    training = pd.read_csv(FEATURES_PATH)
    training["log_salary"] = np.log1p(training["estimated_annual_salary_lpa"])
    matrix = training[KMEANS_FEATURES]
    scaler = StandardScaler()
    scaler.fit(matrix)
    return scaler


def make_model_features(profile: ProfileInput) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    values = {
        "years_experience": profile.years_experience,
        "seniority_ord": SENIORITY_ORD[profile.seniority_level],
        "certifications_count": profile.certifications_count,
        "profile_completeness_pct": profile.profile_completeness_pct,
        "log_endorsements": float(np.log1p(profile.endorsement_count)),
        "skill_count": profile.skill_count,
        "education_ord": EDUCATION_ORD[profile.education_level],
        "update_ord": UPDATE_ORD[profile.last_profile_update],
        "connections_ord": CONNECTIONS_ORD[profile.connections_tier],
        "in_demand_skill_flag_bin": int(profile.in_demand_skill_flag),
        "open_to_work_bin": int(profile.open_to_work),
        "uses_generative_ai_tools_bin": int(profile.uses_generative_ai_tools),
        "work_mode": profile.work_mode,
    }
    logistic = pd.DataFrame([{key: values[key] for key in LOGISTIC_FEATURES}])
    linear = pd.DataFrame([{key: values[key] for key in LINEAR_FEATURES}])
    kmeans = pd.DataFrame([{
        "years_experience": profile.years_experience,
        "log_salary": float(np.log1p(profile.estimated_annual_salary_lpa)),
        # employability_score is a required K-Means dimension. For a new profile,
        # use the Logistic Regression positive-class probability on its 0-100 scale.
        "employability_score": np.nan,
        "certifications_count": profile.certifications_count,
        "education_ord": values["education_ord"],
        "in_demand_skill_flag_bin": values["in_demand_skill_flag_bin"],
        "uses_generative_ai_tools_bin": values["uses_generative_ai_tools_bin"],
    }], columns=KMEANS_FEATURES)
    return logistic, linear, kmeans


app = FastAPI(title="Employment Skill Gap Analysis API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"status": "API running"}


@app.post("/analyze")
def analyze_profile(profile: ProfileInput):
    try:
        models = load_models()
        logistic_features, linear_features, kmeans_features = make_model_features(profile)

        logistic_model = models["logistic"]
        high_employability = int(logistic_model.predict(logistic_features)[0])
        probabilities = logistic_model.predict_proba(logistic_features)[0]
        classes = list(logistic_model.classes_)
        positive_index = classes.index(1)
        employability_score = float(probabilities[positive_index] * 100)

        salary_prediction_log = float(models["linear"].predict(linear_features)[0])
        estimated_salary_lpa = float(np.expm1(salary_prediction_log))

        kmeans_features.loc[0, "employability_score"] = employability_score
        scaler = load_kmeans_scaler()
        scaled_kmeans_features = scaler.transform(kmeans_features[KMEANS_FEATURES])
        cluster = int(models["kmeans"].predict(scaled_kmeans_features)[0])
    except (RuntimeError, FileNotFoundError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Model inference failed: {exc}") from exc

    return {
        "high_employability": high_employability,
        "high_employability_probability": employability_score / 100,
        "employability_score": employability_score,
        "kmeans_employability_score_source": "logistic_probability_percent",
        "estimated_annual_salary_lpa": estimated_salary_lpa,
        "salary_prediction_log1p": salary_prediction_log,
        "cluster": cluster,
    }
