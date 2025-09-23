with open("bunker_data.sql") as f:
    data = f.read()

data = data.replace("`", "")
data = data.replace("AUTO_INCREMENT", "SERIAL")
data = data.replace("TINYINT(1)", "BOOLEAN")
# optionally replace 1/0 in INSERTs with TRUE/FALSE if needed

with open("bunker_data_pg.sql", "w") as f:
    f.write(data)
