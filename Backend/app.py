import os
import pandas as pd
import joblib
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from model import train_model, predict_fraud

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

UPLOAD_FOLDER = os.path.abspath("uploads")
ALLOWED_EXTENSIONS = {"csv", "xlsx"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(file_path)
        return jsonify({"message": "File uploaded successfully", "filename": filename}), 200

    return jsonify({"error": "Invalid file type"}), 400


@app.route("/files", methods=["GET"])
def list_files():
    files = os.listdir(app.config["UPLOAD_FOLDER"])
    return jsonify({"files": files}), 200

@app.route("/view_data/<filename>", methods=["GET"])
def view_data(filename):
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)

    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))

    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404

    try:
        df = pd.read_csv(file_path)
        
        df.insert(0, 'Sr No', range(1, len(df) + 1))
        
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_df = df.iloc[start_idx:end_idx]
        
        response = {
            "total_rows": len(df),
            "current_page": page,
            "per_page": per_page,
            "columns": df.columns.tolist(),
            "data": paginated_df.to_dict(orient='records')
        }
        
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": f"Error reading CSV: {str(e)}"}), 500


@app.route("/analyze/<filename>", methods=["GET"])
def analyze_data(filename):
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    model_path = "fraud_model.pkl"

    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404

    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        return jsonify({"error": f"Error reading CSV: {str(e)}"}), 500

    try:
        if "Class" in df.columns:
            fraud_count = df[df["Class"] == 1].shape[0]
            non_fraud_count = df[df["Class"] == 0].shape[0]
            analysis = {
                "total_transactions": df.shape[0],
                "fraudulent_transactions": fraud_count,
                "non_fraudulent_transactions": non_fraud_count,
                "missing_values": df.isnull().sum().to_dict(),
            }
            return jsonify(analysis), 200

        if not os.path.exists(model_path):
            train_success = train_model(df, model_path)
            if not train_success:
                return jsonify({"error": "Cannot train model. Ensure dataset has 'Class' column."}), 500

        print("🔎 No 'Class' column found. Performing predictions using the model...")
        
        predictions = predict_fraud(df, model_path)

        if len(predictions) == 0:
            return jsonify({"error": "Unable to make predictions"}), 500

        fraud_count = (predictions == 1).sum()
        non_fraud_count = (predictions == 0).sum()

        analysis = {
            "total_transactions": len(predictions),
            "fraudulent_transactions": int(fraud_count),
            "non_fraudulent_transactions": int(non_fraud_count),
            "missing_values": df.isnull().sum().to_dict(),
        }
        return jsonify(analysis), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Welcome to the Fraud Detection API"}), 200


@app.route("/predict/<filename>", methods=["POST"])
def predict(filename):
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    model_path = "fraud_model.pkl"

    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404

    df = pd.read_csv(file_path)

    if "Class" in df.columns:
        predictions = df["Class"].values
        return jsonify({"predictions": predictions.tolist()}), 200

    if not os.path.exists(model_path):
        train_success = train_model(df, model_path)
        if not train_success:
            return jsonify({"error": "Cannot train model. Ensure dataset has 'Class' column."}), 500

    predictions = predict_fraud(df, model_path)
    if len(predictions) == 0:
        return jsonify({"error": "Unable to make predictions"}), 500

    return jsonify({"predictions": predictions.tolist()}), 200


@app.route('/delete/<filename>', methods=['DELETE'])
def delete_file(filename):
    try:
        safe_filename = secure_filename(filename)
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], safe_filename)
        
        print(f"Attempting to delete file: {file_path}")
        
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                print(f"Successfully deleted file: {file_path}")
                
                model_filename = f"model_{safe_filename}.joblib"
                model_path = os.path.join(app.config["UPLOAD_FOLDER"], model_filename)
                if os.path.exists(model_path):
                    os.remove(model_path)
                    print(f"Successfully deleted model file: {model_path}")
                
                return jsonify({
                    "message": f"File {filename} deleted successfully",
                    "status": "success"
                })
            except PermissionError as pe:
                print(f"Permission error: {str(pe)}")
                return jsonify({
                    "error": f"Permission denied when deleting file: {str(pe)}",
                    "status": "error"
                }), 403
            except Exception as e:
                print(f"Error during deletion: {str(e)}")
                return jsonify({
                    "error": f"Error during file deletion: {str(e)}",
                    "status": "error"
                }), 500
        else:
            print(f"File not found: {file_path}")
            return jsonify({
                "error": f"File {filename} not found",
                "status": "error"
            }), 404
            
    except Exception as e:
        print(f"General error: {str(e)}")
        return jsonify({
            "error": f"Error processing delete request: {str(e)}",
            "status": "error"
        }), 500


if __name__ == "__main__":
    app.run(port=5000)