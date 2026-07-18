import cianparser
import json

def fetch_krasnodar_flats():
    print("Fetching Krasnodar flats from CIAN...")
    parser = cianparser.CianParser(location="Краснодар")
    data = parser.get_flats(
        deal_type="rent_long",
        rooms=(1, 2, 3),
        with_saving_csv=False,
        additional_settings={"start_page": 1, "end_page": 1}
    )
    print(f"Fetched {len(data)} items.")
    if data:
        print("Sample item:", json.dumps(data[0], ensure_ascii=False, indent=2))
        
if __name__ == "__main__":
    fetch_krasnodar_flats()
