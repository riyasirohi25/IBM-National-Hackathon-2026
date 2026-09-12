import sys
import os
import pandas as pd
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'ai', 'scoring_config'))
from weights import WEIGHTS

DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'dataset', 'krishi_pramaan_dataset', 'farmers.csv')

def get_averages():
    try:
        df = pd.read_csv(DATASET_PATH)
        return {
            "crop_diversity": df["crop_diversity"].mean(),
            "market_price_stability": df["market_price_stability"].mean(),
            "insurance_claim_ratio": df["insurance_claim_ratio"].mean(),
            "community_trust_score": df["community_trust_score"].mean(),
            "evidence_confidence_avg": 0.85
        }
    except Exception:
        return {
            "crop_diversity": 0.65,
            "market_price_stability": 0.68,
            "insurance_claim_ratio": 0.22,
            "community_trust_score": 0.81,
            "evidence_confidence_avg": 0.85
        }

AVERAGES = get_averages()

def generate_reason(key, val, contribution):
    pts_str = f"(+{round(contribution, 1)} pts)"
    if key == "pmkisan_enrollment":
        return f"Enrolled in PM-KISAN, showing good institutional linkage. {pts_str}" if val >= 0.5 else f"Not enrolled in PM-KISAN, missing out on institutional benefits. {pts_str}"
    
    avg = AVERAGES.get(key, 0.5)
    
    if key == "insurance_claim_ratio":
        # val is already (1.0 - raw_ratio) from inputs
        raw_val = 1.0 - val
        if raw_val <= avg:
            return f"Low insurance claim history ({raw_val*100:.0f}%), indicating lower risk compared to avg {avg*100:.0f}%. {pts_str}"
        else:
            return f"Higher insurance claim history ({raw_val*100:.0f}%), slightly above regional avg {avg*100:.0f}%. {pts_str}"
            
    if key == "evidence_confidence_avg":
        if val >= avg:
            return f"Strong evidence confidence ({val*100:.0f}%), well above the {avg*100:.0f}% regional baseline. {pts_str}"
        else:
            return f"Evidence confidence ({val*100:.0f}%) is below the {avg*100:.0f}% baseline. Needs more attestations. {pts_str}"
            
    friendly_names = {
        "crop_diversity": "Crop diversification",
        "market_price_stability": "Market price stability",
        "community_trust_score": "Community trust score"
    }
    name = friendly_names.get(key, key)
    
    if val >= avg + 0.05:
        return f"{name} is strong at {val:.2f}, above the regional average of {avg:.2f}. {pts_str}"
    elif val >= avg - 0.05:
        return f"{name} is average at {val:.2f}, matching regional norms ({avg:.2f}). {pts_str}"
    else:
        return f"{name} is below average at {val:.2f} (regional avg: {avg:.2f}). {pts_str}"

def calculate_score(inputs: dict):
    raw_score = 0.0
    explanation = {}
    
    for key, weight in WEIGHTS.items():
        val = float(inputs.get(key, 0.7))
        if val > 1.0 and val <= 100.0 and key not in ["seasonal_income", "seasonal_expenses"]:
            val = val / 100.0
            
        contribution = val * weight * 100.0
        raw_score += contribution
        explanation[key] = generate_reason(key, val, contribution)
        
    creditworthiness_score = round(min(max(raw_score, 0), 100), 0)
    
    seasonal_income = float(inputs.get("seasonal_income", 280000.0))
    seasonal_expenses = float(inputs.get("seasonal_expenses", 90000.0))
    existing_debt_amount = float(inputs.get("existing_debt_amount", 48000.0))
    
    repayment_capacity = max(seasonal_income - seasonal_expenses - existing_debt_amount, 10000.0)
    
    risk_adjustment_factor = creditworthiness_score / 100.0
    recommended_limit = round((repayment_capacity * risk_adjustment_factor) / 1000.0) * 1000.0
    
    purpose_split = {
        "inputs": round(recommended_limit * 0.60),
        "labour": round(recommended_limit * 0.20),
        "irrigation": round(recommended_limit * 0.20)
    }
    
    return {
        "creditworthiness_score": creditworthiness_score,
        "repayment_capacity": repayment_capacity,
        "recommended_limit": recommended_limit,
        "purpose_split": purpose_split,
        "explanation": explanation
    }
