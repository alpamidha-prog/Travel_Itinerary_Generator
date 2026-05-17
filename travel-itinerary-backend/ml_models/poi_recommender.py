from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import numpy as np

class POIRecommender:
    def __init__(self):
        self.scaler = StandardScaler()
        self.kmeans = KMeans(n_clusters=5, random_state=42)
    
    def _extract_features(self, items):
        # mock feature extraction
        return [[item.get('lat', 0), item.get('lng', 0), item.get('rating', 3)] for item in items]
        
    def _extract_user_features(self, profile):
        # mock profile feature
        return [profile.get('pref_lat', 0), profile.get('pref_lng', 0), profile.get('pref_rating', 4)]

    def fit_user_preferences(self, user_history):
        """Learn user preferences from history"""
        features = self._extract_features(user_history)
        if len(features) < 5:
            # Not enough data for 5 clusters
            self.kmeans = KMeans(n_clusters=max(1, len(features)), random_state=42)
        scaled_features = self.scaler.fit_transform(features)
        self.kmeans.fit(scaled_features)
    
    def recommend(self, user_profile, available_pois):
        """Recommend POIs based on user profile"""
        # If no model trained, return random/all
        if not hasattr(self.kmeans, 'cluster_centers_'):
            return available_pois

        user_features = self._extract_user_features(user_profile)
        scaled = self.scaler.transform([user_features])
        cluster = self.kmeans.predict(scaled)[0]
        
        # Filter POIs by cluster and preferences
        recommendations = self._filter_by_cluster(
            available_pois, 
            cluster,
            user_profile.get('interests', [])
        )
        return recommendations

    def _filter_by_cluster(self, pois, cluster, interests):
        # mock filtering, just return a subset
        features = self._extract_features(pois)
        scaled = self.scaler.transform(features)
        clusters = self.kmeans.predict(scaled)
        
        filtered = [pois[i] for i in range(len(pois)) if clusters[i] == cluster]
        return filtered if filtered else pois
