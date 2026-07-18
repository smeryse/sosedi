import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("Fetching real Krasnodar listings from CIAN...");

const pythonCode = `
import cianparser, json, re

parser = cianparser.CianParser('Краснодар')
flats_1 = parser.get_flats('rent_long', rooms=(1,), with_saving_csv=False, additional_settings={'start_page': 1, 'end_page': 1})
flats_2 = parser.get_flats('rent_long', rooms=(2,), with_saving_csv=False, additional_settings={'start_page': 1, 'end_page': 1})

raw_list = flats_1 + flats_2
props = []
images = [
    '/demo/properties/center-loft.jpg',
    '/demo/properties/festival-flat.jpg',
    '/demo/properties/park-room.jpg',
    '/demo/properties/yubileyniy-room.jpg'
]

district_map = {
    'р-н Центральный': 'Центральный район',
    'р-н Прикубанский': 'Прикубанский округ',
    'р-н Западный': 'Западный округ (ФМР / ЮМР)',
    'р-н Карасунский': 'Карасунский округ (ГМР / ЧМР)',
}

for idx, item in enumerate(raw_list):
    cian_url = item.get('url', '')
    match_id = re.search(r'/flat/(\\d+)/', cian_url)
    flat_id = f'cian-{match_id.group(1)}' if match_id else f'cian-{idx}'
    prop_id = 'center-loft' if idx == 0 else flat_id
    
    rooms = item.get('rooms_count', 1)
    area = int(item.get('total_area', 40))
    street = item.get('street', '')
    house = item.get('house_number', '')
    address = f'ул. {street}, д. {house}' if street and house else (f'ул. {street}' if street else 'г. Краснодар')
    district = district_map.get(item.get('district', ''), item.get('district', '').replace('р-н ', '') + ' район' if item.get('district') else 'Краснодар')
    price = int(item.get('price_per_month', 30000))
    floor_str = f"{item.get('floor', 1)}/{item.get('floors_count', 9)}"
    
    title = f"{rooms}-комн. квартира, {area} м² — {district}"
    
    tags = ['Реальный объект ЦИАН']
    if item.get('author'):
        tags.append(f"От: {item['author']}")
    if item.get('commissions') == 0:
        tags.append('Без комиссии')
    if item.get('total_area', 0) >= 55:
        tags.append('Просторная')
        
    props.append({
        'id': prop_id,
        'title': title,
        'address': address,
        'district': district,
        'price': price,
        'rooms': rooms,
        'area': area,
        'floor': floor_str,
        'image': images[idx % len(images)],
        'match': 98 - (idx % 12),
        'photosCount': 10 + (idx % 8),
        'tags': tags[:3],
        'cianUrl': cian_url
    })

print(json.dumps(props, ensure_ascii=False))
`;

const resultJson = execSync(`.venv/bin/python -c "${pythonCode.replace(/"/g, '\\"')}"`, {
  encoding: "utf-8",
  maxBuffer: 10 * 1024 * 1024
});

const properties = JSON.parse(resultJson.trim());
console.log(`Received ${properties.length} real properties from CIAN.`);

const fileContent = `export type DemoRoommate = {
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

export const demoProperties: DemoProperty[] = ${JSON.stringify(properties, null, 2)};

export function formatRubles(value: number) {
  return \`\${new Intl.NumberFormat("ru-RU").format(value)} ₽\`;
}
`;

const targetPath = path.join(__dirname, "../data/demo.ts");
fs.writeFileSync(targetPath, fileContent, "utf-8");
console.log(`Successfully updated ${targetPath}!`);
