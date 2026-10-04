export const modelMetrics = {
  logistic: {
    accuracy: 69.5,
    precision: 69.7,
    recall: 69.3,
    f1: 69.5,
    rocAuc: 0.765,
    cvAccuracy: 69.8,
    precisionRaw: 0.6967418546365914,
    recallRaw: 0.6932668329177057,
    rocAucRaw: 0.7646013065359436,
    cvAccuracyMeanRaw: 0.6976666666666667,
    cvAccuracyStdRaw: 0.006752571526627654,
  },

  linear: {
    r2Log: 0.939,
    r2Raw: 0.905,
    mae: 3.511,
    rmse: 6.281,
    cvR2: 0.940,
    comparisons: [
      { model: 'A · Experience only', r2Log: 0.819, r2Raw: 0.065, mae: 7.435, mse: 389.664, rmse: 19.74, cvR2: 0.817 },
      { model: 'B · + Seniority', r2Log: 0.924, r2Raw: 0.881, mae: 3.883, mse: 49.594, rmse: 7.042, cvR2: 0.926 },
      { model: 'C · Full model', r2Log: 0.939, r2Raw: 0.905, mae: 3.511, mse: 39.449, rmse: 6.281, cvR2: 0.940 },
    ],
  },

  kmeans: {
    k: 4,
    silhouette: 0.2900653501842131,
    inertia: 46559.86402788224,
  },
};
