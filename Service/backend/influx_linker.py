from influxdb_client import InfluxDBClient, Point, WriteOptions

class Influxlinker:
    def __init__(self, url='http://localhost:8086', token='iFZAb1Wj2JTZkHzN_nsyFNCgJvOCiMKK51qf-PP4H-fN88kHTvBOrbm4wD4de8Cfsy-O8a79sa4r_MQFnMTPrw==', org='bibo', bucket='bibo'):
        self.client = InfluxDBClient(url=url, token=token, org=org)
        self.write_api = self.client.write_api(write_options=WriteOptions(batch_size=1))
        self.query_api = self.client.query_api()
        self.bucket = bucket
        self.org = org

    def write_position(self, tag_id, x, y, timestamp):
        point = Point("uwb_position") \
            .tag("tag_id", tag_id) \
            .field("x", x) \
            .field("y", y) \
            .time(timestamp)
        self.write_api.write(bucket=self.bucket, record=point)

    def query_positions(self, tag_id, start_date, end_date):
        query = f'''
        from(bucket: "{self.bucket}")
          |> range(start: {start_date}, stop: {end_date})
          |> filter(fn: (r) => r._measurement == "uwb_position" and r.tag_id == "{tag_id}")
          |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
          |> sort(columns: ["_time"])
        '''
        result = self.query_api.query(org=self.org, query=query)
        data = []
        for table in result:
            for record in table.records:
                data.append({
                    "time": str(record.get_time()),
                    "x": record["x"],
                    "y": record["y"]
                })
        return data
