-- Initialize PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify PostGIS installation
SELECT PostGIS_version();

-- Create indexes for spatial queries (will be created by migrations, but for reference)
-- CREATE INDEX idx_merchant_location ON merchants USING GIST(location);
-- CREATE INDEX idx_user_hub_location ON user_hubs USING GIST(location);
-- CREATE INDEX idx_cctv_location ON cctv_cameras USING GIST(location);
