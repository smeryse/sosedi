import cianparser
import json
import re
import os

DISTRICT_MAP = {
    "р-н Центральный": "Центральный район",
    "р-н Прикубанский": "Прикубанский округ",
    "р-н Западный": "Западный округ (ФМР / ЮМР)",
    "р-н Карасунский": "Карасунский округ (ГМР / ЧМР)",
}

IMAGES = [
    "/demo/properties/center-loft.jpg",
    "/demo/properties/festival-flat.jpg",
    "/demo/properties/park-room.jpg",
    "/demo/properties/yubileyniy-room.jpg",
]

def clean_district(d):
    return DISTRICT_MAP.get(d, d.replace("р-н ", "") + " район" if d else "Краснодар")

def generate_tags(item):
    tags = []
    if item.get("author"):
        tags.append(f"От: {item['author']}")
    if item.get("commissions") == 0:
        tags.append("Без комиссии")
    else:
        tags.append(f"Комиссия {item.get('commissions')}%")
    
    floors = item.get("floors_count", 0)
    floor = item.get("floor", 0)
    if floor > 10:
        tags.append("Высокий этаж")
    elif floor == 1:
        tags.append("1-й этаж")
    
    if item.get("total_area", 0) >= 60:
        tags.append("Просторная")
    
    tags.append("Реальный объект ЦИАН")
    return tags[:3]

def main():
    print("Fetching real Krasnodar listings from CIAN...")
    parser = cianparser.CianParser(location="Краснодар")
    
    # Fetch 1-room and 2-room flats for rent
    flats_1 = parser.get_flats(
        deal_type="rent_long",
        rooms=(1,),
        with_saving_csv=False,
        additional_settings={"start_page": 1, "end_page": 1}
    )
    flats_2 = parser.get_flats(
        deal_type="rent_long",
        rooms=(2,),
        with_saving_csv=False,
        additional_settings={"start_page": 1, "end_page": 1}
    )
    
    raw_list = flats_1 + flats_2
    print(f"Total raw listings fetched: {len(raw_list)}")
    
    properties = []
    
    # We want to keep 'center-loft' ID for backward compatibility with tests/demo state
    for idx, item in enumerate(raw_list):
        cian_url = item.get("url", "")
        match_id = re.search(r'/flat/(\d+)/', cian_url)
        flat_id = f"cian-{match_id.group(1)}" if match_id else f"cian-{idx}"
        
        if idx == 0:
            # Main featured property ID used by demo-repository default state
            prop_id = "center-loft"
        else:
            prop_id = flat_id
            
        rooms = item.get("rooms_count", 1)
        area = int(item.get("total_area", 40))
        street = item.get("street", "")
        house = item.get("house_number", "")
        
        address = f"ул. {street}, {house}".strip(", ") if street else f"г. Краснодар, объект #{idx+1}"
        district = clean_district(item.get("district", ""))
        price = int(item.get("price_per_month", 30000))
        floor_str = f"{item.get('floor', 1)}/{item.get('floors_count', 9)}"
        
        title = f"{rooms}-комн. квартира, {area} м² ({district})"
        
        # Calculate compatibility match score (between 85 and 98)
        match_score = 98 - (idx % 12)
        
        prop = {
            "id": prop_id,
            "title": title,
            "address": address,
            "district": district,
            "price": price,
            "rooms": rooms,
            "area": area,
            "floor": floor_str,
            "image": IMAGES[idx % len(IMAGES)],
            "match": match_score,
            "photosCount": 10 + (idx % 8),
            "tags": generate_tags(item),
            "cianUrl": cian_url,
        }
        properties.append(prop)
        
    print(f"Prepared {len(properties)} properties.")
    
    # Save json dump
    with open("data/cian_krasnodar.json", "w", encoding="utf-8") as f:
        json.dump(properties, f, ensure_ascii=False, indent=2)
        
    print("Saved data/cian_krasnodar.json")

if __name__ == "__main__":
    main()
