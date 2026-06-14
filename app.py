from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import re
from datetime import datetime
 
app = Flask(__name__)
CORS(app)
 
DATA_FILE = "donors.json"
 
# --- LOAD DATA ---
def load_data():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r") as f:
                return json.load(f)
        except json.JSONDecodeError:
            print("❌ Error: Invalid JSON in donors.json")
            return []
        except Exception as e:
            print(f"❌ Error loading data: {e}")
            return []
    return []
 
# --- SAVE DATA (CLEAN FORMAT) ---
def save_data(data):
    try:
        with open(DATA_FILE, "w") as f:
            json.dump(data, f, indent=4)
        return True
    except Exception as e:
        print(f"❌ Error saving data: {e}")
        return False
 
# --- VALIDATION FUNCTIONS ---
def is_valid_phone(phone):
    """Validate 10-digit Indian phone number"""
    return bool(re.match(r'^\d{10}$', phone))
 
def is_valid_email(email):
    """Validate email format"""
    return bool(re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email))
 
def is_valid_blood_group(blood):
    """Validate blood group"""
    valid_groups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
    return blood in valid_groups
 
# --- HOME ROUTE ---
@app.route('/')
def home():
    return "✅ Blood Support Backend Running", 200
 
# --- REGISTER DONOR ---
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
 
        # ✅ VALIDATION CHECKS
        if not data:
            return jsonify({"error": "No data provided"}), 400
 
        # Validate required fields
        required_fields = ['name', 'phone', 'email', 'bloodGroup', 'state', 'district', 'city']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"Missing required field: {field}"}), 400
 
        # Validate phone number
        if not is_valid_phone(data['phone']):
            return jsonify({"error": "Invalid phone number. Must be 10 digits."}), 400
 
        # Validate email
        if not is_valid_email(data['email']):
            return jsonify({"error": "Invalid email format"}), 400
 
        # Validate blood group
        if not is_valid_blood_group(data['bloodGroup']):
            return jsonify({"error": "Invalid blood group"}), 400
 
        # Check if phone already registered
        donors = load_data()
        for donor in donors:
            if donor.get('phone') == data['phone']:
                return jsonify({"error": "Phone number already registered"}), 409
 
        # Clean and sanitize data
        donor_data = {
            'name': data['name'].strip(),
            'phone': data['phone'].strip(),
            'email': data['email'].strip(),
            'bloodGroup': data['bloodGroup'].strip(),
            'state': data['state'].strip(),
            'district': data['district'].strip(),
            'city': data['city'].strip(),
            'registeredAt': datetime.now().isoformat()
        }
 
        # Add new donor
        donors.append(donor_data)
 
        # Save data
        if save_data(donors):
            return jsonify({
                "message": "✅ Registered successfully",
                "donor": donor_data
            }), 200
        else:
            return jsonify({"error": "Failed to save data"}), 500
 
    except Exception as e:
        print(f"❌ Register error: {e}")
        return jsonify({"error": "Server error"}), 500
 
# --- SEARCH DONORS ---
@app.route('/search', methods=['POST'])
def search():
    try:
        data = request.json
 
        if not data:
            return jsonify({"error": "No search criteria provided"}), 400
 
        blood = data.get("bloodGroup", "").strip()
        district = data.get("district", "").strip()
 
        # Validation
        if not blood or not district:
            return jsonify({"error": "Blood group and district are required"}), 400
 
        if not is_valid_blood_group(blood):
            return jsonify({"error": "Invalid blood group"}), 400
 
        donors = load_data()
 
        # Search with case-insensitive district matching
        matched = [
            d for d in donors
            if d.get("bloodGroup") == blood and
               d.get("district", "").strip().lower() == district.lower()
        ]
 
        # Return as array directly (not wrapped in object)
        return jsonify(matched), 200
 
    except Exception as e:
        print(f"❌ Search error: {e}")
        return jsonify({"error": "Server error"}), 500
 
# --- GET ALL DONORS (FOR DEBUGGING) ---
@app.route('/donors', methods=['GET'])
def get_all_donors():
    """Returns all registered donors (for admin/debug purposes)"""
    donors = load_data()
    return jsonify({
        "total": len(donors),
        "donors": donors
    }), 200
 
# --- HEALTH CHECK ---
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200
 
if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)