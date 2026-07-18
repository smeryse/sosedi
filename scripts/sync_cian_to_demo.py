import cianparser
import json
import re
import sys

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

ROOMMATES_CODE = '''export type DemoRoommate = {
  id: string;
  name: string;
  age: number;
  job: string;
  budget: number;
  district: string;
  compatibility: number;
  image: string;
  traits: string[];
};

export type DemoProperty = {
  id: string;
  title: string;
  address: string;
  district: string;
  price: number;
  rooms: number;
  area: number;
  floor: string;
  image: string;
  match: number;
  photosCount: number;
  tags: string[];
  cianUrl?: string;
};

export const demoRoommates: DemoRoommate[] = [
  {
    id: "maria",
    name: "Мария",
    age: 24,
    job: "Маркетолог",
    budget: 25_000,
    district: "Центральный район",
    compatibility: 96,
    image: "/demo/people/maria.jpg",
    traits: ["Спокойная", "Любит порядок"],
  },
  {
    id: "artem",
    name: "Артём",
    age: 27,
    job: "Разработчик",
    budget: 28_000,
    district: "Прикубанский округ",
    compatibility: 94,
    image: "/demo/people/artem.jpg",
    traits: ["Без вечеринок", "Работает из дома"],
  },
  {
    id: "ekaterina",
    name: "Екатерина",
    age: 26,
    job: "Дизайнер",
    budget: 30_000,
    district: "Западный округ",
    compatibility: 93,
    image: "/demo/people/ekaterina.jpg",
    traits: ["Не курит", "Ценит тишину"],
  },
  {
    id: "ilya",
    name: "Илья",
    age: 29,
    job: "Предприниматель",
    budget: 27_000,
    district: "Карасунский округ",
    compatibility: 91,
    image: "/demo/people/ilya.jpg",
    traits: ["Работает из дома", "Без гостей"],
  },
];
'''

FORMAT_RUBLES_CODE = '''
export function formatRubles(value: number) {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}
'''

def clean_district(d):
    return DISTRICT_MAP.get(d, d.replace("р-н ", "") + " район" if d else "Краснодар")

def generate_tags(item):
    tags = ["Реальный объект ЦИАН"]
    if item.get("author"):
        tags.append(f"От: {item['author']}")
    if item.get("commissions") == 0:
        tags.append("Без комиссии")
    
    floor = item.get("floor", 0)
    if floor > 10:
        tags.append("Высокий этаж")
    elif floor == 1:
        tags.append("1-й этаж")
    
    if item.get("total_area", 0) >= 55:
        tags.append("Просторная")
    
    return tags[:3]

def main():
    parser = cianparser.CianParser(location="Краснодар")
    
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
    properties = []
    
    for idx, item in enumerate(raw_list):
        cian_url = item.get("url", "")
        match_id = re.search(r'/flat/(\d+)/', cian_url)
        flat_id = f"cian-{match_id.group(1)}" if match_id else f"cian-{idx}"
        
        # Keep 'center-loft' for first item to preserve existing references
        prop_id = "center-loft" if idx == 0 else flat_id
            
        rooms = item.get("rooms_count", 1)
        area = int(item.get("total_area", 40))
        street = item.get("street", "")
        house = item.get("house_number", "")
        
        if street and house:
            address = f"ул. {street}, д. {house}"
        elif street:
            address = f"ул. {street}"
        else:
            address = f"г. Краснодар, объявление #{idx+1}"
            
        district = clean_district(item.get("district", ""))
        price = int(item.get("price_per_month", 30000))
        floor_str = f"{item.get('floor', 1)}/{item.get('floors_count', 9)}"
        
        title = f"{rooms}-комн. квартира, {area} м² — {district}"
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
        
    ts_content = ROOMMATES_CODE + "\nexport const demoProperties: DemoProperty[] = " + json.dumps(properties, ensure_ascii=False, indent=2) + ";\n" + FORMAT_RUBLES_CODE
    sys.stdout.write(ts_content)

if __name__ == "__main__":
    main()
