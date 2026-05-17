from prophet import Prophet
import pandas as pd

class CostPredictor:
    def __init__(self):
        self.model = Prophet(
            changepoint_prior_scale=0.05,
            seasonality_mode='multiplicative'
        )
    
    def train(self, historical_data):
        """
        historical_data format:
        {
            'ds': ['2023-01-01', ...],  # dates
            'y': [150, 200, ...]         # costs
        }
        """
        df = pd.DataFrame(historical_data)
        self.model.fit(df)
    
    def predict(self, destination, dates):
        """Predict costs for given dates"""
        future = pd.DataFrame({'ds': dates})
        forecast = self.model.predict(future)
        return forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]
