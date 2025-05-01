# Fraud Detection System

A machine learning-based fraud detection system that uses Random Forest Classifier to identify fraudulent transactions. The system includes both a backend API and a frontend interface for easy interaction.

## Features

- Upload and analyze CSV files containing transaction data
- Automatic model training on labeled datasets
- Fraud prediction on unlabeled datasets
- Interactive data visualization
- RESTful API for integration with other systems
- Support for both single and batch predictions

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

## Requirement

- flask==2.0.1
- flask-cors==3.0.10
- pandas==1.3.3
- scikit-learn==0.24.2
- imbalanced-learn==0.8.1
- joblib==1.0.1
- numpy==1.21.2 

## Installation

1. Clone the repository:
```bash
git clone https://github.com/teocheekeat/Fraud-detection.git
cd Fraud-detection
```

2. Create a virtual environment (recommended):
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install required packages:
```bash
pip install -r requirements.txt
```

## Project Structure

```
Fraud-detection/
├── Backend/
│   ├── app.py           # Flask API server
│   ├── model.py         # Machine learning model implementation
│   └── utils.py         # Utility functions
├── frontend/
│   ├── index.html       # Main web interface
│   ├── style.css        # Styling
│   ├── script.js        # Frontend logic
│   └── documentation.md # Documentation
└── uploads/             # Directory for uploaded files
```

## Usage

1. Start the backend server:
```bash
cd Backend
python app.py
```

2. Open the frontend:
- Open `frontend/index.html` in your web browser
- Or serve it using a local web server

3. Using the API:
- Upload files: POST to `/upload`
- List files: GET `/files`
- View data: GET `/view_data/<filename>`
- Analyze data: GET `/analyze/<filename>`
- Make predictions: POST `/predict/<filename>`
- Delete files: DELETE `/delete/<filename>`

## Data Format

The system expects CSV files with the following format:
- Required columns: V1, V2, ..., V28 (features)
- Optional column: Class (0 for non-fraud, 1 for fraud)
- Amount column (optional)
- https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud

## Model Details

- Algorithm: Random Forest Classifier
- Features: 28 anonymized features (V1-V28)
- Preprocessing: StandardScaler
- Balancing: SMOTE (Synthetic Minority Over-sampling Technique)
- Model file: fraud_model.pkl (run model.py)

## API Endpoints

- `GET /`: Welcome message
- `POST /upload`: Upload a CSV file
- `GET /files`: List uploaded files
- `GET /view_data/<filename>`: View file contents
- `GET /analyze/<filename>`: Analyze data
- `POST /predict/<filename>`: Make predictions
- `DELETE /delete/<filename>`: Delete a file

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Flask for the web framework
- scikit-learn for machine learning capabilities
- Pandas for data manipulation
