import sqlite3
import os

# ensure the app directory exists
db_dir = "./app"
os.makedirs(db_dir, exist_ok=1)

db_path = os.path.join(db_dir, "app.db")

sql_script = """
-- ==========================================
-- 1. users table
-- ==========================================
create table if not exists users
(
    id integer primary key autoincrement,
    name varchar(100) not null,
    email varchar(255) not null unique,
    password varchar(255) not null,
    created_at date not null default current_date,
    updated_at date not null default current_date
);

-- ==========================================
-- 2. plants table
-- ==========================================
create table if not exists plants
(
    plant_id integer primary key autoincrement,
    scientific_name varchar(150) not null,
    common_name varchar(100) not null,
    max_height real not null,
    light_requirements varchar(100) not null,
    soil_ph_max real not null,
    soil_ph_min real not null,
    water_needed varchar(100) not null,
    optimum_soil_moisture_pct real not null,
    critical_drought_pct real not null,
    
    -- newly added columns
    h_soil real not null, 
    l_soil real not null, 
    h_temp real not null, 
    l_temp real not null, 
    h_humi real not null, 
    l_humi real not null, 
    sensor_check_interval_hrs integer not null,

    constraint uq_plants_scientific_name unique (scientific_name),
    constraint chk_soil_ph check (soil_ph_min >= 0 and soil_ph_max <= 14 and soil_ph_min <= soil_ph_max),
    constraint chk_max_height check (max_height > 0),
    constraint chk_soil_moisture check (optimum_soil_moisture_pct between 0 and 100),
    constraint chk_critical_drought check (critical_drought_pct between 0 and 100),
    constraint chk_soil_moisture_limits check (h_soil between 0 and 100 and l_soil between 0 and 100 and l_soil <= h_soil),
    constraint chk_temp_limits check (l_temp <= h_temp),
    constraint chk_humidity_limits check (h_humi between 0 and 100 and l_humi between 0 and 100 and l_humi <= h_humi),
    constraint chk_sensor_interval check (sensor_check_interval_hrs > 0)
);

-- ==========================================
-- 3. user_plants table
-- ==========================================
create table if not exists user_plants
(
    user_id integer not null,
    plant_id integer not null,
    growth_stage varchar(50) not null,

    constraint pk_user_plants primary key (user_id, plant_id),
    constraint fk_user_plants_users foreign key (user_id) references users(id) on delete cascade,
    constraint fk_user_plants_plants foreign key (plant_id) references plants(plant_id) on delete cascade
);
"""

def create_database():
    try:
        # connect to the sqlite database (this creates it if it doesn't exist)
        conn = sqlite3.connect(db_path)
        
        # enable foreign key support in sqlite (disabled by default)
        conn.execute("pragma foreign_keys = on;")
        
        cursor = conn.cursor()
        
        # execute the sql script
        cursor.executescript(sql_script)
        
        # commit the changes
        conn.commit()
        print(f"database successfully created at: {db_path}")
        
    except:
        print("an error occurred while creating the database.")
        
    finally:
        try:
            conn.close()
        except:
            pass

if __name__ == "__main__":
    create_database()