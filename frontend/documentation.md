# Fraud Detection System Documentation

## Overview
This documentation explains how the Fraud Detection System works, focusing on the frontend implementation. The system provides a user-friendly interface for analyzing transaction data and detecting potential fraudulent activities.

## System Architecture

### Frontend Components
The frontend consists of three main files:
1. `index.html` - The main user interface
2. `style.css` - Styling and layout
3. `script.js` - Core functionality and API interactions

### Data Processing Pipeline

#### 1. Data Loading
- **File Format**: The system accepts CSV files containing transaction data
- **Required Columns**: 
  - Time: Transaction timestamp
  - V1-V28: Anonymized features (PCA components)
  - Amount: Transaction amount
  - Class: Binary label (0 for legitimate, 1 for fraudulent)
- **Validation**: System checks for required columns and data types
- **Error Handling**: Invalid files are rejected with appropriate error messages

#### 2. Data Preprocessing
The system implements several preprocessing steps to improve model performance:

##### a. Feature Scaling
- **StandardScaler**: Normalizes features to have zero mean and unit variance
- **Justification**: 
  - Ensures all features contribute equally to the model
  - Improves convergence during training
  - Makes the model less sensitive to feature scales

##### b. Imbalance Handling
- **SMOTE (Synthetic Minority Over-sampling Technique)**:
  - Creates synthetic samples for the minority class (fraudulent transactions)
  - Balances the class distribution
- **Downsampling Alternative**:
  - Reduces majority class samples to match minority class
  - Used when SMOTE is not applicable
- **Justification**:
  - Prevents model bias towards majority class
  - Improves detection of rare fraud cases
  - Enhances model's ability to learn fraud patterns

##### c. Missing Value Handling
- **Zero Imputation**: Missing values are filled with 0
- **Justification**:
  - Maintains data integrity
  - Prevents model errors from missing values
  - Simple and effective for this specific dataset

#### 3. Model Training
The system uses a Random Forest Classifier with the following configuration:

##### a. Model Architecture
- **Algorithm**: Random Forest Classifier
- **Parameters**:
  - n_estimators: 100 (number of decision trees)
  - max_depth: 10 (maximum tree depth)
  - min_samples_split: 5 (minimum samples required to split)
  - min_samples_leaf: 2 (minimum samples in leaf nodes)
  - class_weight: 'balanced' (handles class imbalance)
  - random_state: 42 (ensures reproducibility)

##### b. Training Process
1. **Data Splitting**:
   - 80% training data
   - 20% testing data
   - Stratified sampling to maintain class distribution
2. **Pipeline Creation**:
   - Combines preprocessing and model training
   - Ensures consistent transformation of data
3. **Model Fitting**:
   - Trains on preprocessed training data
   - Validates on test set

##### c. Justification
- Random Forest chosen for:
  - Robustness to outliers
  - Ability to handle non-linear relationships
  - Feature importance analysis capability
  - Good performance on imbalanced data

#### 4. Model Evaluation
The system evaluates model performance using multiple metrics:

##### a. Performance Metrics
- **Accuracy**: Overall prediction correctness
- **Precision**: Ratio of true positives to all positive predictions
- **Recall**: Ratio of true positives to all actual positives
- **Average Precision Score**: Summarizes precision-recall curve
- **Classification Report**: Detailed performance metrics by class

##### b. Feature Importance Analysis
- Ranks features by their contribution to predictions
- Helps identify most significant fraud indicators
- Enables feature selection and optimization

##### c. Justification
- Multiple metrics provide comprehensive evaluation
- Focus on precision and recall for fraud detection
- Feature importance helps understand model behavior

### Authentication System
- Secure login system with username/password authentication
- Session persistence using localStorage
- Default credentials:
  - Username: teocheekeat
  - Password: 10102020abc

## Key Features

### 1. File Management
- **File Upload**: Users can upload CSV files containing transaction data
- **File List**: Displays all uploaded files with options to:
  - Select files for analysis
  - Delete files
- **Data Preview**: Shows the contents of selected files in a paginated table

### 2. Data Analysis
The system provides three main visualization tools:

#### a. Transaction Distribution Chart
- Doughnut chart showing the ratio of legitimate vs. fraudulent transactions
- Color-coded for easy interpretation:
  - Green: Legitimate transactions
  - Red: Fraudulent transactions
- Includes percentage calculations and hover tooltips

#### b. Amount Distribution Chart
- Bar chart displaying transaction amounts
- Helps identify unusual transaction patterns
- Useful for spotting outliers and potential fraud

#### c. Time Pattern Analysis
- Line chart showing transaction patterns over time
- Helps identify suspicious timing patterns
- Useful for detecting coordinated fraudulent activities

### 3. Fraud Prediction
- Real-time fraud detection using machine learning
- Analyzes transaction patterns and characteristics
- Provides confidence scores for predictions
- Highlights potentially fraudulent transactions

## Technical Implementation

### API Integration
- Backend API endpoint: `http://127.0.0.1:5000`
- Key endpoints:
  - `/upload` - File upload
  - `/files` - List uploaded files
  - `/analyze` - Data analysis
  - `/predict` - Fraud prediction

### Data Processing
1. **File Upload**:
   - Validates file type (CSV)
   - Sends to backend for processing
   - Updates file list on success

2. **Data Analysis**:
   - Fetches transaction data
   - Processes for visualization
   - Updates charts in real-time

3. **Fraud Prediction**:
   - Sends transaction data to backend
   - Receives prediction results
   - Updates UI with findings

## User Interface Components

### 1. Login Page
- Clean, modern design
- Secure authentication
- Error handling for invalid credentials

### 2. Main Dashboard
- File upload section with drag-and-drop support
- File management interface
- Data visualization area
- Interactive charts and tables

### 3. Data Display
- Paginated table view
- Sortable columns
- Search functionality
- Export options

## Security Features
- Secure authentication
- Session management
- Input validation
- Error handling
- Secure API communication

## Best Practices
1. **Data Privacy**:
   - Secure file handling
   - Protected API endpoints
   - Data encryption

2. **Performance**:
   - Efficient data loading
   - Optimized chart rendering
   - Responsive design

3. **User Experience**:
   - Intuitive interface
   - Clear error messages
   - Helpful tooltips
   - Responsive feedback

## Usage Guide

### Getting Started
1. Log in using provided credentials
2. Upload a CSV file with transaction data
3. Select the file from the list
4. Use the analysis tools to examine the data
5. Run fraud prediction to identify suspicious transactions

### File Format Requirements
- CSV format
- Required columns:
  - Transaction ID
  - Amount
  - Timestamp
  - Other relevant transaction details

### Analysis Tools
1. **Transaction Distribution**:
   - Shows overall fraud ratio
   - Helps understand data composition

2. **Amount Distribution**:
   - Identifies unusual transaction amounts
   - Helps spot outliers

3. **Time Pattern**:
   - Shows transaction timing patterns
   - Helps identify suspicious activity patterns

## Troubleshooting
- Check file format if upload fails
- Verify API connection if analysis fails
- Clear browser cache if experiencing display issues
- Contact support for persistent problems

## Future Enhancements
- Real-time fraud detection
- Advanced machine learning models
- Customizable analysis parameters
- Export functionality
- Multi-user support
- Enhanced visualization options 