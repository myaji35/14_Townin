#!/usr/bin/env python3
"""
Townin GraphRAG Setup - Neo4j Schema & Sample Data
Creates knowledge graph for insurance inference validation

Usage:
    python setup_neo4j.py
"""

import os
import random
from dotenv import load_dotenv
from neo4j import GraphDatabase

load_dotenv()


class TowninGraphSetup:
    def __init__(self):
        self.driver = GraphDatabase.driver(
            os.getenv("NEO4J_URI"),
            auth=(os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))
        )

    def close(self):
        self.driver.close()

    def clear_database(self):
        """Clear existing data (for testing)"""
        with self.driver.session() as session:
            session.run("MATCH (n) DETACH DELETE n")
        print("✓ Database cleared")

    def create_schema(self):
        """Create node and relationship constraints"""
        with self.driver.session() as session:
            # Constraints for unique IDs
            session.run("CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE")
            session.run("CREATE CONSTRAINT location_id IF NOT EXISTS FOR (l:Location) REQUIRE l.grid_cell IS UNIQUE")
            session.run("CREATE CONSTRAINT product_id IF NOT EXISTS FOR (p:InsuranceProduct) REQUIRE p.id IS UNIQUE")

        print("✓ Schema created")

    def populate_sample_data(self):
        """Create 100 synthetic users + locations + insurance products"""

        # Seoul locations with real characteristics
        seoul_locations = [
            {"grid_cell": "gangnam_01", "district": "강남구", "property_value_tier": 5, "flood_risk": False, "crime_rate": "low"},
            {"grid_cell": "gangnam_02", "district": "강남구", "property_value_tier": 5, "flood_risk": False, "crime_rate": "low"},
            {"grid_cell": "bundang_01", "district": "분당구", "property_value_tier": 4, "flood_risk": False, "crime_rate": "low"},
            {"grid_cell": "bundang_02", "district": "분당구", "property_value_tier": 4, "flood_risk": True, "crime_rate": "low"},
            {"grid_cell": "mapo_01", "district": "마포구", "property_value_tier": 3, "flood_risk": True, "crime_rate": "medium"},
            {"grid_cell": "songpa_01", "district": "송파구", "property_value_tier": 4, "flood_risk": True, "crime_rate": "low"},
            {"grid_cell": "gwanak_01", "district": "관악구", "property_value_tier": 2, "flood_risk": False, "crime_rate": "medium"},
        ]

        # Korean insurance products (real-world examples)
        insurance_products = [
            {"id": "samsung_property_01", "name": "삼성화재 가정종합보험", "category": "property", "coverage_type": "comprehensive", "target_age": "30-60"},
            {"id": "kb_health_01", "name": "KB손해보험 실손의료보험", "category": "health", "coverage_type": "medical", "target_age": "20-70"},
            {"id": "hanwha_care_01", "name": "한화생명 간병보험", "category": "care", "coverage_type": "long_term_care", "target_age": "50-80"},
            {"id": "samsung_life_01", "name": "삼성생명 종신보험", "category": "life", "coverage_type": "whole_life", "target_age": "30-60"},
            {"id": "db_auto_01", "name": "DB손해보험 자동차보험", "category": "auto", "coverage_type": "comprehensive", "target_age": "20-70"},
        ]

        # Risk factors
        risk_factors = [
            {"type": "flood", "severity": "high", "description": "홍수 위험 지역"},
            {"type": "health_decline", "severity": "medium", "description": "건강 악화 징후"},
            {"type": "property_damage", "severity": "medium", "description": "재산 손실 위험"},
            {"type": "accident", "severity": "low", "description": "사고 위험"},
        ]

        with self.driver.session() as session:
            # Create locations
            for loc in seoul_locations:
                session.run("""
                    CREATE (l:Location {
                        grid_cell: $grid_cell,
                        district: $district,
                        property_value_tier: $property_value_tier,
                        flood_risk: $flood_risk,
                        crime_rate: $crime_rate
                    })
                """, **loc)
            print(f"✓ Created {len(seoul_locations)} locations")

            # Create insurance products
            for product in insurance_products:
                session.run("""
                    CREATE (p:InsuranceProduct {
                        id: $id,
                        name: $name,
                        category: $category,
                        coverage_type: $coverage_type,
                        target_age: $target_age
                    })
                """, **product)
            print(f"✓ Created {len(insurance_products)} insurance products")

            # Create risk factors
            for risk in risk_factors:
                session.run("""
                    CREATE (r:RiskFactor {
                        type: $type,
                        severity: $severity,
                        description: $description
                    })
                """, **risk)
            print(f"✓ Created {len(risk_factors)} risk factors")

            # Create synthetic users
            age_ranges = ["25-34", "35-44", "45-54", "55-64", "65+"]
            household_types = ["single", "couple", "family_young", "family_senior"]
            behavior_categories = ["grocery", "health", "home_improvement", "senior_care", "auto", "cosmetics"]

            for i in range(100):
                user_id = f"user_{i:03d}"
                age_range = random.choice(age_ranges)
                household = random.choice(household_types)
                location = random.choice(seoul_locations)["grid_cell"]

                # Create user
                session.run("""
                    CREATE (u:User {
                        id: $user_id,
                        age_range: $age_range,
                        household_type: $household
                    })
                """, user_id=user_id, age_range=age_range, household=household)

                # Connect to location
                session.run("""
                    MATCH (u:User {id: $user_id})
                    MATCH (l:Location {grid_cell: $grid_cell})
                    CREATE (u)-[:LIVES_IN]->(l)
                """, user_id=user_id, grid_cell=location)

                # Add behaviors (1-3 random categories)
                behaviors = random.sample(behavior_categories, k=random.randint(1, 3))
                for behavior in behaviors:
                    session.run("""
                        MATCH (u:User {id: $user_id})
                        MERGE (b:Behavior {category: $category})
                        CREATE (u)-[:EXHIBITS]->(b)
                    """, user_id=user_id, category=behavior)

                # Add IoT patterns (only for 30% of users - those with care needs)
                if random.random() < 0.3:
                    anomaly_count = random.randint(0, 10)
                    session.run("""
                        MATCH (u:User {id: $user_id})
                        CREATE (iot:IoTPattern {
                            activity_level: $activity,
                            anomaly_count: $anomalies
                        })
                        CREATE (u)-[:HAS_PATTERN]->(iot)
                    """, user_id=user_id, activity=random.choice(["low", "medium", "high"]), anomalies=anomaly_count)

            print(f"✓ Created 100 synthetic users with behaviors")

            # Create relationships: Location -> RiskFactor
            session.run("""
                MATCH (l:Location)
                WHERE l.flood_risk = true
                MATCH (r:RiskFactor {type: 'flood'})
                CREATE (l)-[:HAS_RISK]->(r)
            """)

            # Create relationships: Behavior -> RiskFactor
            session.run("""
                MATCH (b:Behavior {category: 'home_improvement'})
                MATCH (r:RiskFactor {type: 'property_damage'})
                CREATE (b)-[:INDICATES]->(r)
            """)

            session.run("""
                MATCH (b:Behavior {category: 'senior_care'})
                MATCH (r:RiskFactor {type: 'health_decline'})
                CREATE (b)-[:INDICATES]->(r)
            """)

            # Create relationships: RiskFactor -> InsuranceProduct
            session.run("""
                MATCH (r:RiskFactor {type: 'flood'})
                MATCH (p:InsuranceProduct {category: 'property'})
                CREATE (r)-[:COVERED_BY]->(p)
            """)

            session.run("""
                MATCH (r:RiskFactor {type: 'health_decline'})
                MATCH (p:InsuranceProduct {category: 'care'})
                CREATE (r)-[:COVERED_BY]->(p)
            """)

            session.run("""
                MATCH (r:RiskFactor {type: 'property_damage'})
                MATCH (p:InsuranceProduct {category: 'property'})
                CREATE (r)-[:COVERED_BY]->(p)
            """)

            print("✓ Created relationships (Location->Risk, Behavior->Risk, Risk->Insurance)")

    def verify_data(self):
        """Print summary of created data"""
        with self.driver.session() as session:
            user_count = session.run("MATCH (u:User) RETURN count(u) as count").single()["count"]
            location_count = session.run("MATCH (l:Location) RETURN count(l) as count").single()["count"]
            product_count = session.run("MATCH (p:InsuranceProduct) RETURN count(p) as count").single()["count"]
            relationship_count = session.run("MATCH ()-[r]->() RETURN count(r) as count").single()["count"]

            print("\n" + "="*60)
            print("DATABASE SUMMARY")
            print("="*60)
            print(f"Users: {user_count}")
            print(f"Locations: {location_count}")
            print(f"Insurance Products: {product_count}")
            print(f"Total Relationships: {relationship_count}")
            print("="*60)

            # Sample query: Find users in flood zones
            flood_users = session.run("""
                MATCH (u:User)-[:LIVES_IN]->(l:Location)-[:HAS_RISK]->(r:RiskFactor {type: 'flood'})
                RETURN count(u) as count
            """).single()["count"]
            print(f"\nSample Query: Users in flood zones = {flood_users}")


def main():
    """Main setup script"""
    print("Townin GraphRAG Setup - Neo4j Database\n")

    setup = TowninGraphSetup()

    try:
        # Clear existing data (comment out if you want to keep existing data)
        print("[1/4] Clearing existing data...")
        setup.clear_database()

        # Create schema
        print("[2/4] Creating schema...")
        setup.create_schema()

        # Populate sample data
        print("[3/4] Populating sample data...")
        setup.populate_sample_data()

        # Verify
        print("[4/4] Verifying data...")
        setup.verify_data()

        print("\n✅ Setup complete! You can now run langchain_integration.py")

    finally:
        setup.close()


if __name__ == "__main__":
    main()
