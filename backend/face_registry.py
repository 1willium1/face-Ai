"""
Face Registry — stores and manages face profiles (InsightFace ArcFace 512-D embeddings).
"""

import json
import os
import numpy as np
from typing import List, Dict, Optional

DATABASE_PATH = os.path.join(os.path.dirname(__file__), "face_database.json")


class FaceRegistry:
    """Manages registered person profiles with ArcFace embeddings."""

    def __init__(self, db_path: str = DATABASE_PATH):
        self.db_path = db_path
        self.persons: Dict[str, Dict] = {}
        self.loaded = False
        self.load()

    def load(self):
        """Load the face database from JSON."""
        if os.path.exists(self.db_path):
            try:
                with open(self.db_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                self.persons = data.get("persons", {})
                self.loaded = True
                print(f"[FaceRegistry] Loaded {len(self.persons)} person(s) from {self.db_path}")
            except Exception as e:
                print(f"[FaceRegistry] Error loading database: {e}")
                self.persons = {}
                self.loaded = True
        else:
            self.persons = {}
            self.loaded = True
            print(f"[FaceRegistry] No database found, starting empty.")

    def save(self):
        """Save the face database to JSON."""
        data = {
            "version": "2.0",
            "model": "InsightFace-ArcFace",
            "embedding_dim": 512,
            "persons": self.persons,
        }
        with open(self.db_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"[FaceRegistry] Saved {len(self.persons)} person(s) to {self.db_path}")

    def register_person(
        self,
        person_id: str,
        name: str,
        role: str = "",
        title: str = "",
        embeddings: List[List[float]] = None,
    ) -> Dict:
        """Register a new person with their face embeddings."""
        self.persons[person_id] = {
            "id": person_id,
            "name": name,
            "role": role,
            "title": title,
            "embeddings": embeddings or [],
            "embedding_count": len(embeddings) if embeddings else 0,
            "model_name": "ArcFace-InsightFace",
            "embedding_dim": 512,
        }
        self.save()
        return self.persons[person_id]

    def add_embeddings(self, person_id: str, new_embeddings: List[List[float]]):
        """Add more embeddings to an existing person."""
        if person_id not in self.persons:
            raise ValueError(f"Person '{person_id}' not found")
        self.persons[person_id]["embeddings"].extend(new_embeddings)
        self.persons[person_id]["embedding_count"] = len(self.persons[person_id]["embeddings"])
        self.save()

    def get_person(self, person_id: str) -> Optional[Dict]:
        return self.persons.get(person_id)

    def get_all_embeddings(self, person_id: str) -> List[List[float]]:
        """Get all stored embeddings for a person."""
        person = self.persons.get(person_id)
        if person:
            return person.get("embeddings", [])
        return []

    def get_target_profile(self) -> Optional[Dict]:
        """Get the first (primary) registered person as the target."""
        if self.persons:
            first_id = list(self.persons.keys())[0]
            return self.persons[first_id]
        return None

    def get_person_count(self) -> int:
        return len(self.persons)

    def get_registered_persons(self) -> List[Dict]:
        result = []
        for pid, pdata in self.persons.items():
            result.append({
                "id": pid,
                "name": pdata.get("name", pid),
                "role": pdata.get("role", ""),
                "title": pdata.get("title", ""),
                "embedding_count": pdata.get("embedding_count", 0),
                "model_name": pdata.get("model_name", "ArcFace"),
            })
        return result

    def is_loaded(self) -> bool:
        return self.loaded


# Singleton
_registry: Optional[FaceRegistry] = None


def get_registry() -> FaceRegistry:
    global _registry
    if _registry is None:
        _registry = FaceRegistry()
    return _registry
