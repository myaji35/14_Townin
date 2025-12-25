"""
Townin GraphRAG Pipeline Test
Tests the complete GraphRAG pipeline from document processing to querying
"""

from neo4j import GraphDatabase
import time

# Neo4j connection settings
URI = "bolt://localhost:7687"
AUTH = ("neo4j", "test1234")

def clear_database(driver):
    """Clear all existing data"""
    with driver.session() as session:
        session.run("MATCH (n) DETACH DELETE n")
        print("✓ Database cleared")

def create_sample_graph(driver):
    """Create sample insurance knowledge graph"""
    with driver.session() as session:
        # Create Location nodes
        session.run("""
            CREATE (l1:Location {
                name: '강남구 역삼동',
                type: 'neighborhood',
                cctv_count: 45,
                crime_rate: 0.02,
                parking_score: 7.5,
                safety_score: 8.2
            })
        """)

        session.run("""
            CREATE (l2:Location {
                name: '송파구 잠실동',
                type: 'neighborhood',
                cctv_count: 38,
                crime_rate: 0.015,
                parking_score: 6.8,
                safety_score: 8.5
            })
        """)

        # Create User nodes (anonymous)
        session.run("""
            CREATE (u1:User {
                user_id: 'user_001',
                age_group: '30s',
                family_type: 'couple_with_kids',
                activity_pattern: 'high'
            })
        """)

        session.run("""
            CREATE (u2:User {
                user_id: 'user_002',
                age_group: '60s',
                family_type: 'elderly_couple',
                activity_pattern: 'low'
            })
        """)

        # Create Insurance Product nodes
        session.run("""
            CREATE (p1:InsuranceProduct {
                product_id: 'cancer_001',
                name: '암보험 플러스',
                category: 'health',
                coverage_type: 'cancer',
                monthly_premium: 50000,
                coverage_amount: 100000000,
                age_limit: 70
            })
        """)

        session.run("""
            CREATE (p2:InsuranceProduct {
                product_id: 'accident_001',
                name: '교통사고 특약',
                category: 'accident',
                coverage_type: 'traffic_accident',
                monthly_premium: 30000,
                coverage_amount: 50000000,
                age_limit: 75
            })
        """)

        session.run("""
            CREATE (p3:InsuranceProduct {
                product_id: 'senior_care_001',
                name: '시니어케어 보험',
                category: 'care',
                coverage_type: 'long_term_care',
                monthly_premium: 80000,
                coverage_amount: 150000000,
                age_limit: 80
            })
        """)

        # Create Risk Factor nodes
        session.run("""
            CREATE (r1:RiskFactor {
                risk_id: 'traffic_risk_001',
                type: 'traffic',
                severity: 'medium',
                description: '주요 도로 인접 지역'
            })
        """)

        session.run("""
            CREATE (r2:RiskFactor {
                risk_id: 'health_risk_001',
                type: 'health',
                severity: 'high',
                description: '고령 가구 건강 위험'
            })
        """)

        # Create relationships
        # User -> Location
        session.run("""
            MATCH (u:User {user_id: 'user_001'}), (l:Location {name: '강남구 역삼동'})
            CREATE (u)-[:LIVES_IN {hub_type: 'residence', since: date('2023-01-01')}]->(l)
        """)

        session.run("""
            MATCH (u:User {user_id: 'user_002'}), (l:Location {name: '송파구 잠실동'})
            CREATE (u)-[:LIVES_IN {hub_type: 'residence', since: date('2020-06-15')}]->(l)
        """)

        # Location -> Risk
        session.run("""
            MATCH (l:Location {name: '강남구 역삼동'}), (r:RiskFactor {risk_id: 'traffic_risk_001'})
            CREATE (l)-[:HAS_RISK {weight: 0.6}]->(r)
        """)

        session.run("""
            MATCH (l:Location {name: '송파구 잠실동'}), (r:RiskFactor {risk_id: 'traffic_risk_001'})
            CREATE (l)-[:HAS_RISK {weight: 0.4}]->(r)
        """)

        # User -> Risk (inferred from age/family type)
        session.run("""
            MATCH (u:User {user_id: 'user_002'}), (r:RiskFactor {risk_id: 'health_risk_001'})
            CREATE (u)-[:EXPOSED_TO {inference_confidence: 0.85}]->(r)
        """)

        # Risk -> Insurance Product
        session.run("""
            MATCH (r:RiskFactor {risk_id: 'traffic_risk_001'}), (p:InsuranceProduct {product_id: 'accident_001'})
            CREATE (r)-[:COVERED_BY {coverage_match: 0.9}]->(p)
        """)

        session.run("""
            MATCH (r:RiskFactor {risk_id: 'health_risk_001'}), (p:InsuranceProduct {product_id: 'senior_care_001'})
            CREATE (r)-[:COVERED_BY {coverage_match: 0.95}]->(p)
        """)

        session.run("""
            MATCH (r:RiskFactor {risk_id: 'health_risk_001'}), (p:InsuranceProduct {product_id: 'cancer_001'})
            CREATE (r)-[:COVERED_BY {coverage_match: 0.8}]->(p)
        """)

        print("✓ Sample graph created")

def verify_graph_structure(driver):
    """Verify the graph structure"""
    with driver.session() as session:
        # Count nodes by type
        result = session.run("MATCH (n) RETURN labels(n)[0] as label, count(n) as count")
        print("\n=== Node Counts ===")
        for record in result:
            print(f"  {record['label']}: {record['count']}")

        # Count relationships
        result = session.run("MATCH ()-[r]->() RETURN type(r) as rel_type, count(r) as count")
        print("\n=== Relationship Counts ===")
        for record in result:
            print(f"  {record['rel_type']}: {record['count']}")

def test_insurance_recommendation_query(driver):
    """Test GraphRAG query for insurance recommendation"""
    print("\n=== Test Query: Insurance Recommendation for user_002 ===")

    query = """
    MATCH path = (u:User {user_id: 'user_002'})
                 -[:LIVES_IN]-> (l:Location)
                 -[:HAS_RISK]-> (r:RiskFactor)
                 -[:COVERED_BY]-> (p:InsuranceProduct)
    RETURN u.user_id as user,
           u.age_group as age_group,
           l.name as location,
           r.type as risk_type,
           r.severity as severity,
           p.name as product_name,
           p.category as category,
           p.monthly_premium as premium
    ORDER BY r.severity DESC, p.monthly_premium ASC
    """

    with driver.session() as session:
        result = session.run(query)
        records = list(result)

        if records:
            print(f"\nFound {len(records)} recommendation(s):\n")
            for i, record in enumerate(records, 1):
                print(f"{i}. User: {record['user']} ({record['age_group']})")
                print(f"   Location: {record['location']}")
                print(f"   Risk: {record['risk_type']} (severity: {record['severity']})")
                print(f"   Recommended: {record['product_name']} ({record['category']})")
                print(f"   Premium: {record['premium']:,}원/월\n")
        else:
            print("No recommendations found")

def test_multi_hop_reasoning(driver):
    """Test multi-hop reasoning through graph"""
    print("\n=== Test Query: Multi-hop Reasoning (User -> Risk -> Products) ===")

    query = """
    MATCH path = (u:User)-[:EXPOSED_TO]->(r:RiskFactor)-[:COVERED_BY]->(p:InsuranceProduct)
    WHERE u.user_id = 'user_002'
    RETURN u.user_id as user,
           u.age_group as age_group,
           u.family_type as family_type,
           r.description as risk_description,
           collect({
               product: p.name,
               category: p.category,
               premium: p.monthly_premium,
               coverage: p.coverage_amount
           }) as recommended_products
    """

    with driver.session() as session:
        result = session.run(query)
        records = list(result)

        if records:
            for record in records:
                print(f"User: {record['user']}")
                print(f"  Age Group: {record['age_group']}")
                print(f"  Family Type: {record['family_type']}")
                print(f"  Risk: {record['risk_description']}")
                print(f"\n  Recommended Products:")
                for product in record['recommended_products']:
                    print(f"    - {product['product']} ({product['category']})")
                    print(f"      Premium: {product['premium']:,}원/월")
                    print(f"      Coverage: {product['coverage']:,}원")
        else:
            print("No multi-hop path found")

def test_location_safety_analysis(driver):
    """Test location safety score analysis"""
    print("\n=== Test Query: Location Safety Analysis ===")

    query = """
    MATCH (l:Location)
    OPTIONAL MATCH (l)-[hr:HAS_RISK]->(r:RiskFactor)
    RETURN l.name as location,
           l.safety_score as safety_score,
           l.cctv_count as cctv_count,
           l.crime_rate as crime_rate,
           count(r) as risk_count,
           collect({type: r.type, severity: r.severity}) as risks
    ORDER BY l.safety_score DESC
    """

    with driver.session() as session:
        result = session.run(query)
        records = list(result)

        print("")
        for record in records:
            print(f"Location: {record['location']}")
            print(f"  Safety Score: {record['safety_score']}/10")
            print(f"  CCTV Count: {record['cctv_count']}")
            print(f"  Crime Rate: {record['crime_rate']}")
            print(f"  Risk Factors: {record['risk_count']}")
            if record['risks'][0]:
                for risk in record['risks']:
                    print(f"    - {risk['type']} (severity: {risk['severity']})")
            print("")

def main():
    """Main test execution"""
    print("=" * 60)
    print("Townin GraphRAG Pipeline Test")
    print("=" * 60)

    try:
        # Connect to Neo4j
        driver = GraphDatabase.driver(URI, auth=AUTH)
        driver.verify_connectivity()
        print("\n✓ Connected to Neo4j")

        # Clear and setup
        clear_database(driver)
        create_sample_graph(driver)
        verify_graph_structure(driver)

        # Run test queries
        test_insurance_recommendation_query(driver)
        test_multi_hop_reasoning(driver)
        test_location_safety_analysis(driver)

        print("\n" + "=" * 60)
        print("✓ All tests completed successfully!")
        print("=" * 60)

        # Close connection
        driver.close()

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1

    return 0

if __name__ == "__main__":
    exit(main())
