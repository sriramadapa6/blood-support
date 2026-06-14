document.addEventListener("DOMContentLoaded", function() {
 
    // --- LOCATION DATA ---
    const locationData = {
        "Andhra Pradesh": {
            "East Godavari": [],
            "West Godavari": [],
            "Krishna": [],
            "Guntur": [],
            "Visakhapatnam": [],
            "Anantapur": [],
            "Kurnool": [],
            "Chittoor": [],
            "Kadapa": [],
            "Nellore": []
        },
        "Telangana": {
            "Hyderabad": [],
            "Rangareddy": [],
            "Warangal": [],
            "Karimnagar": [],
            "Nizamabad": [],
            "Khammam": [],
            "Mahbubnagar": []
        },
        "Tamil Nadu": {
            "Chennai": [],
            "Coimbatore": [],
            "Madurai": [],
            "Salem": [],
            "Tiruchirappalli": [],
            "Erode": [],
            "Vellore": []
        },
        "Karnataka": {
            "Bengaluru Urban": [],
            "Bengaluru Rural": [],
            "Mysuru": [],
            "Hubli-Dharwad": [],
            "Mangalore": [],
            "Belagavi": []
        },
        "Maharashtra": {
            "Mumbai": [],
            "Pune": [],
            "Nagpur": [],
            "Nashik": [],
            "Thane": [],
            "Aurangabad": [],
            "Kolhapur": []
        },
        "Delhi": {
            "New Delhi": [],
            "North Delhi": [],
            "South Delhi": [],
            "East Delhi": [],
            "West Delhi": []
        },
        "Uttar Pradesh": {
            "Lucknow": [],
            "Kanpur": [],
            "Varanasi": [],
            "Agra": [],
            "Noida": [],
            "Ghaziabad": [],
            "Meerut": []
        },
        "Gujarat": {
            "Ahmedabad": [],
            "Surat": [],
            "Vadodara": [],
            "Rajkot": [],
            "Gandhinagar": []
        },
        "Rajasthan": {
            "Jaipur": [],
            "Jodhpur": [],
            "Udaipur": [],
            "Kota": [],
            "Ajmer": []
        },
        "West Bengal": {
            "Kolkata": [],
            "Howrah": [],
            "Darjeeling": [],
            "Hooghly": [],
            "Asansol": []
        },
        "Madhya Pradesh": {
            "Bhopal": [],
            "Indore": [],
            "Gwalior": [],
            "Jabalpur": [],
            "Ujjain": []
        },
        "Bihar": {
            "Patna": [],
            "Gaya": [],
            "Muzaffarpur": [],
            "Bhagalpur": []
        },
        "Punjab": {
            "Amritsar": [],
            "Ludhiana": [],
            "Jalandhar": [],
            "Patiala": []
        },
        "Haryana": {
            "Gurgaon": [],
            "Faridabad": [],
            "Panipat": [],
            "Ambala": []
        },
        "Odisha": {
            "Bhubaneswar": [],
            "Cuttack": [],
            "Rourkela": [],
            "Puri": []
        },
        "Kerala": {
            "Thiruvananthapuram": [],
            "Kochi": [],
            "Kozhikode": [],
            "Thrissur": []
        }
    };
 
    // --- DROPDOWN (STATE -> DISTRICT ONLY) ---
    function setupLocationDropdowns(stateId, districtId) {
        const stateSelect = document.getElementById(stateId);
        const districtSelect = document.getElementById(districtId);
 
        if (!stateSelect || !districtSelect) return;
 
        Object.keys(locationData).sort().forEach(state => {
            stateSelect.add(new Option(state, state));
        });
 
        stateSelect.addEventListener('change', function() {
            districtSelect.innerHTML = '<option disabled selected>Select District</option>';
            districtSelect.disabled = false;
 
            Object.keys(locationData[this.value]).sort().forEach(dist => {
                districtSelect.add(new Option(dist, dist));
            });
        });
    }
 
    setupLocationDropdowns('searchState', 'searchDistrict');
    setupLocationDropdowns('regState', 'regDistrict');
 
    // --- SEARCH DONORS ---
    const searchForm = document.getElementById('searchForm');
 
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
 
            const resultsDiv = document.getElementById('results');
            const searchBg = document.getElementById('bloodGroup').value;
            const searchDistrict = document.getElementById('searchDistrict').value;
 
            if (!searchDistrict) {
                alert("⚠️ Please select a district!");
                return;
            }
 
            resultsDiv.style.display = 'block';
            resultsDiv.innerHTML = "🔍 Searching donors...";
 
            fetch("http://127.0.0.1:5000/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bloodGroup: searchBg,
                    district: searchDistrict
                })
            })
            .then(res => {
                // Check if response is OK
                if (!res.ok) {
                    throw new Error(`Server error: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                // Handle empty results
                if (!data || !Array.isArray(data) || data.length === 0) {
                    resultsDiv.innerHTML = "❌ No donors found with " + searchBg + " blood group in " + searchDistrict;
                    return;
                }
 
                // Display results
                let html = `<div class="donor-list">`;
 
                data.forEach(donor => {
                    html += `
                        <div class="donor-card">
                            <h4>${donor.name || 'N/A'}</h4>
                            <p><strong>Blood:</strong> ${donor.bloodGroup || 'N/A'}</p>
                            <p>📞 ${donor.phone || 'N/A'}</p>
                            <p>📍 ${donor.city || 'N/A'}, ${donor.district || 'N/A'}, ${donor.state || 'N/A'}</p>
 
                            <button class="btn-contact" onclick="callDonor('${donor.phone}')">
                                📞 Contact Donor
                            </button>
                        </div>
                    `;
                });
 
                html += `</div>`;
                resultsDiv.innerHTML = html;
            })
            .catch(err => {
                console.error("Search error:", err);
                resultsDiv.innerHTML = "❌ Server error: " + err.message + "<br><small>Make sure Flask server is running on http://127.0.0.1:5000</small>";
            });
        });
    }
 
    // --- REGISTER DONOR ---
    const registerForm = document.getElementById('registerForm');
 
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
 
            // Validate email format
            const email = document.getElementById('regEmail').value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert("⚠️ Please enter a valid email address");
                return;
            }
 
            const newDonor = {
                name: document.getElementById('regName').value,
                email: document.getElementById('regEmail').value,
                phone: document.getElementById('regPhone').value,
                bloodGroup: document.getElementById('regBloodGroup').value,
                state: document.getElementById('regState').value,
                district: document.getElementById('regDistrict').value,
                city: document.getElementById('regCity').value,
                registeredAt: new Date().toISOString()
            };
 
            fetch("http://127.0.0.1:5000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newDonor)
            })
            .then(res => res.json())
            .then(() => {
                alert("✅ Registered successfully!\n🔒 Your data is securely stored in our database.");
 
                const resultBox = document.getElementById('reg-result');
                resultBox.style.display = 'block';
                resultBox.innerHTML = `<strong>Thank you!</strong> Your registration is complete. We'll contact you when we need your blood.`;
 
                registerForm.reset();
                document.getElementById('regDistrict').disabled = true;
            })
            .catch(err => {
                console.error(err);
                alert("❌ Server error. Please try again.");
            });
        });
    }
 
    // --- AI SMART MATCH ---
    const mlForm = document.getElementById('mlForm');
 
    if (mlForm) {
        mlForm.addEventListener('submit', function(e) {
            e.preventDefault();
 
            const distance = parseFloat(document.getElementById('distance').value);
            const days = parseFloat(document.getElementById('days').value);
            const reliability = parseFloat(document.getElementById('reliability').value);
            const urgency = parseFloat(document.getElementById('urgency').value);
 
            const resultBox = document.getElementById('ai-result');
            resultBox.style.display = 'block';
 
            let score = 100;
            score -= distance * 2;
            score += reliability;
            score -= days * 0.2;
            score += urgency * 10;
 
            score = Math.max(0, Math.min(100, Math.round(score)));
 
            let color = "#dc3545";
            let msg = "Low probability";
 
            if (score > 70) {
                color = "#28a745";
                msg = "High probability";
            } else if (score > 40) {
                color = "#ffc107";
                msg = "Medium probability";
            }
 
            resultBox.innerHTML = `
                <div style="font-size: 36px; font-weight: 700; color: ${color};">
                    ${score}%
                </div>
                <div style="font-size: 14px; color: #555;">
                    Match Score
                </div>
                <div style="margin-top: 8px; color: ${color}; font-weight: 500;">
                    ${msg}
                </div>
            `;
        });
    }
 
});
 
// Contact donor function
function callDonor(phone) {
    window.location.href = `tel:${phone}`;
}
 
