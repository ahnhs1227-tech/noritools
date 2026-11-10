/* Authored calculator labels, checks and worked examples. */
Object.assign(window.NoriMessages,{
  "헤베 계산기 — 면적·자재 수량·비용": [
    "Square Meter & Material Cost Calculator",
    "平米（㎡）計算機 — 面積・材料数量・費用",
    "面积、材料数量与费用计算器"
  ],
  "헤베·자재 수량 계산기 · NORI Tools": [
    "Square Meter & Material Cost Calculator · NORI Tools",
    "平米（㎡）・材料費計算機 · NORI Tools",
    "面积、材料数量与费用计算器 · NORI Tools"
  ],
  "헤베 계산기": [
    "Square Meter Calculator",
    "平米（㎡）計算機",
    "面积计算器"
  ],
  "면적·평수·자재 수량과 비용을 계산해요.": [
    "Calculate area, material quantities and cost.",
    "面積・材料数量・費用を計算します。",
    "计算面积、材料数量与费用。"
  ],
  "헤베(㎡)와 루베(㎥)는 달라요": [
    "Square metres and cubic metres are different",
    "平米（㎡）と立米（㎥）の違い",
    "平方米与立方米的区别"
  ],
  "1헤베는 1㎡입니다. 1m × 1m의 면적이며 약 0.3025평입니다. 루베는 부피 단위인 ㎥로, 면적에 두께나 높이를 곱해야 합니다. 이 도구는 면적·자재 수량·비용을 계산하며 부피 계산은 지원하지 않습니다.": [
    "One square metre is the area of 1m × 1m. It is approximately 0.3025 Korean pyeong. Cubic metres measure volume: multiply area by thickness or height. This tool calculates area, material quantities and cost; it does not calculate volume.",
    "1平米は1㎡、1m×1mの面積です。韓国の坪では約0.3025坪です。立米は体積の単位㎥で、面積に厚さや高さを掛けます。このツールは面積・材料数量・費用用で、体積計算には対応していません。",
    "1平方米是1m×1m的面积，约等于0.3025韩国坪。立方米是体积单位，需要用面积乘以厚度或高度。本工具计算面积、材料数量和费用，不计算体积。"
  ],
  "실전 비교: 낱장과 포장 중 어느 쪽이 저렴할까요?": [
    "Practical comparison: individual tiles or full packs?",
    "実例：1枚購入と梱包購入、どちらが安い？",
    "实际比较：按片买还是整包买？"
  ],
  "3m × 4m, 로스 10%, 600 × 600mm 타일이면 37장이 필요합니다. 낱장 8,000원은 296,000원, 4장 포장 20,000원은 10포장·40장으로 200,000원입니다. 포장은 3장이 더 남지만 이 예시에서는 96,000원 저렴합니다.": [
    "For 3m × 4m with 10% waste and 600 × 600mm tiles, 37 tiles are needed. At KRW 8,000 each, the cost is KRW 296,000. Packs of four at KRW 20,000 require 10 packs (40 tiles), costing KRW 200,000. Packs leave three extra tiles but save KRW 96,000 in this example.",
    "3m×4m、ロス10%、600×600mmタイルなら37枚必要です。1枚8,000ウォンでは296,000ウォン。4枚入り20,000ウォンなら10梱包・40枚で200,000ウォンです。この例では3枚多く残りますが、96,000ウォン安くなります。",
    "3m×4m、损耗10%、600×600mm瓷砖，需要37片。若单片32元，共1,184元；每包4片、80元，则买10包40片，共800元。此例整包多出3片，但省384元。"
  ],
  "실전 예시: 쿠폰과 수량까지 계산하기": [
    "Worked example: coupons and quantities",
    "実例：クーポンと数量まで計算",
    "实际案例：优惠券与数量"
  ],
  "50,000원 상품에 20% 할인과 추가 10% 할인을 적용하면 36,000원입니다. 개당 쿠폰 3,000원을 빼면 33,000원, 2개를 사면 66,000원입니다. 할인율을 더한 30%로 계산하지 않습니다.": [
    "A KRW 50,000 item discounted by 20%, then 10%, costs KRW 36,000. A KRW 3,000 coupon per item reduces it to KRW 33,000; two items cost KRW 66,000. The two discounts do not add up to 30%.",
    "50,000ウォンの商品を20%引き、さらに10%引きにすると36,000ウォン。1個につき3,000ウォンのクーポンで33,000ウォン、2個で66,000ウォンです。割引率を足して30%引きにはしません。",
    "50,000韩元商品先打八折，再打九折，为36,000韩元。每件减3,000韩元优惠券后为33,000韩元，两件共66,000韩元。两次折扣不能直接相加为30%。"
  ],
  "주문 전체 쿠폰은 다르게 입력해요": [
    "Order-level coupons need a different input",
    "注文全体のクーポンは入力方法が異なります",
    "整单优惠券的输入方式不同"
  ],
  "같은 상품 2개의 주문 전체에 쿠폰 3,000원을 한 번만 쓰면 72,000원 − 3,000원 = 69,000원입니다. 이 경우 원래 가격을 100,000원, 수량을 1로 입력하세요. 배송비는 포함하지 않습니다.": [
    "For two items with one KRW 3,000 coupon on the whole order, the total is KRW 72,000 − KRW 3,000 = KRW 69,000. Enter the original price as KRW 100,000 and quantity as 1. Shipping is excluded.",
    "同じ商品2個の注文全体で3,000ウォン引きを1回使う場合は72,000−3,000＝69,000ウォンです。元の価格を100,000ウォン、数量を1にしてください。送料は含みません。",
    "两件商品整单只减一次3,000韩元时，总额为72,000−3,000＝69,000韩元。此时原价输入100,000韩元，数量输入1。不含运费。"
  ],
  "실전 예시: 레시피 2인분을 5인분으로": [
    "Worked example: scale a recipe from 2 to 5 servings",
    "実例：2人分を5人分にする",
    "实际案例：2人份改为5人份"
  ],
  "목표 인분 5 ÷ 원래 인분 2 = 2.5배입니다. 토마토 400g은 1,000g, 껍질을 뺀 달걀 150g은 375g입니다. 오이무침의 간장 1큰술은 2.5큰술입니다. 큰술 15mL 기준이며 일반 식사용 숟가락과 다를 수 있습니다.": [
    "Target 5 ÷ original 2 = 2.5×. Tomatoes go from 400g to 1,000g, and shelled eggs from 150g to 375g. One tablespoon of soy sauce for smashed cucumber becomes 2.5 tablespoons. The example uses a 15mL measuring tablespoon, not an ordinary dining spoon.",
    "目標5人分÷元の2人分＝2.5倍です。トマト400gは1,000g、殻を除いた卵150gは375g。たたききゅうりの醤油大さじ1は大さじ2.5です。大さじは15mLの計量スプーンで、食事用スプーンとは異なる場合があります。",
    "目标5人份÷原来2人份＝2.5倍。西红柿400g变为1,000g，去壳鸡蛋150g变为375g。拍黄瓜的生抽1大勺变为2.5大勺。这里的大勺指15mL量匙，不是普通餐勺。"
  ],
  "소수점 표시가 재료 비율을 바꾸지는 않아요": [
    "Display precision does not change the scaling ratio",
    "表示桁数は倍率を変えません",
    "小数位数不改变配方比例"
  ],
  "0.5큰술을 2.5배 하면 1.25큰술입니다. 소수점 1자리 표시에서는 1.3으로 보이므로 정밀 계량에는 표시 자릿수를 늘리세요. 양념은 나누어 넣고, 조리 시간·화력은 배율대로 늘리지 마세요.": [
    "0.5 tablespoon × 2.5 = 1.25 tablespoons. With one decimal place it displays as 1.3, so increase precision for careful measuring. Add seasonings gradually; cooking time and heat do not scale proportionally.",
    "大さじ0.5×2.5＝大さじ1.25。小数1桁では1.3と表示されるため、正確な計量には桁数を増やしてください。調味料は少しずつ加え、加熱時間・火力を同じ倍率で増やさないでください。",
    "0.5大勺×2.5＝1.25大勺。保留1位小数时显示为1.3，精确计量请增加小数位数。调料分次加入，烹饪时间和火力不要按倍数增加。"
  ],
  "실전 예시: 단위부터 맞추기": [
    "Worked example: align units first",
    "実例：まず単位をそろえる",
    "实际案例：先统一单位"
  ],
  "타일 600mm는 60cm 또는 0.6m입니다. 600mm × 600mm 한 장의 면적은 0.36㎡입니다. 길이를 0.6m로 바꾼 뒤 가로와 세로를 곱하세요. 길이의 변환 배수를 면적에 그대로 적용하면 틀릴 수 있습니다.": [
    "A 600mm tile is 60cm or 0.6m long. A 600 × 600mm tile covers 0.36m². Convert each length to 0.6m before multiplying. Applying a length conversion factor directly to an area gives the wrong result.",
    "600mmは60cm、または0.6mです。600×600mmタイル1枚は0.36㎡。各辺を0.6mに直してから掛けます。長さの換算係数を面積にそのまま使わないでください。",
    "600mm等于60cm或0.6m。600×600mm瓷砖一片面积为0.36㎡。先把两边分别换成0.6m再相乘，不能直接用长度换算倍数换算面积。"
  ],
  "실전 예시: 글자와 바이트는 다릅니다": [
    "Worked example: characters versus bytes",
    "実例：文字数とバイト数の違い",
    "实际案例：字符数与字节数"
  ],
  "“가 나”는 공백 포함 3글자, 공백 제외 2글자, UTF-8 7바이트입니다. 이모지는 화면에 보이는 문자 묶음 기준으로 셉니다. 예를 들어 😀는 1글자지만 UTF-8에서는 4바이트입니다. 제출 사이트가 UTF-16 등 다른 기준을 사용하면 글자 수가 다를 수 있습니다.": [
    "“가 나” has 3 characters with the space, 2 without it and 7 UTF-8 bytes. Emoji are counted as visible character clusters: 😀 is 1 character but 4 UTF-8 bytes. A submission site using another rule, such as UTF-16 units, may report a different count.",
    "「가 나」は空白込み3文字、空白なし2文字、UTF-8で7バイトです。絵文字は見た目の文字のまとまりで数えます。😀は1文字ですがUTF-8では4バイト。提出先がUTF-16など別の基準を使うと文字数が異なる場合があります。",
    "“가 나”含空格为3个字符，不含空格为2个，UTF-8为7字节。表情按视觉字符簇计数：😀是1个字符，但UTF-8为4字节。提交网站若使用UTF-16等其他规则，计数可能不同。"
  ],
  "계산 기준과 음식 예시값": [
    "Calculation method and food example values",
    "計算基準と食品の例示値",
    "计算方法与食物示例值"
  ],
  "휴식 에너지 추정식은 Mifflin-St Jeor 공식을 사용합니다. 활동 계수를 곱한 유지 추정값에서 목표에 따라 300kcal를 빼거나 더하고, 계산 예시는 1,200kcal 아래로 표시하지 않습니다. 이는 도구의 단순한 계산 가정이며 개인별 권장 섭취량이나 안전한 최소량을 뜻하지 않습니다.": [
    "Resting energy is estimated with the Mifflin-St Jeor equation. The maintenance estimate applies an activity factor; the goal example subtracts or adds 300kcal and is not displayed below 1,200kcal. These are simplified tool assumptions, not a personal intake recommendation or a safe minimum.",
    "安静時エネルギーはMifflin-St Jeor式で推定します。活動係数を掛けた維持推定値から目標に応じて300kcalを増減し、例示値は1,200kcal未満にしません。これはツールの簡易的な仮定で、個人の推奨摂取量や安全な最低量を示すものではありません。",
    "静息能量采用Mifflin-St Jeor公式估算，再乘活动系数得到维持估算值。目标示例加减300kcal，且不显示低于1,200kcal的示例值。这只是工具的简化假设，并非个人建议摄入量或安全最低值。"
  ],
  "음식 목록의 열량은 빠른 입력을 위한 예시값이며 특정 제품이나 공공 DB 항목과 일대일로 대응하지 않습니다. 실제 제품 영양표시를 우선 확인하고, 식품안전나라에서 식품·제공량을 확인한 값은 직접 추가로 입력하세요.": [
    "The food list contains quick-entry example values, not exact matches to specific products or public database entries. Prefer the actual product nutrition label. You can look up the food and serving size in the official food database and enter your own value.",
    "食品一覧は簡易入力用の例示値で、特定の商品や公的DB項目と一対一で対応していません。実際の商品の栄養表示を優先してください。公的な食品DBで食品と分量を確認し、手入力することもできます。",
    "食物列表为便捷输入的示例值，不与具体产品或公共数据库条目一一对应。请优先查看实际产品营养标签，也可在官方食品数据库核对食物和份量后手动添加。"
  ],
  "실전 예시: 영양표시로 직접 추가": [
    "Worked example: enter a nutrition label",
    "実例：栄養表示から手入力",
    "实际案例：按营养标签手动添加"
  ],
  "요거트 영양표시에 1개 100g당 80kcal라고 쓰여 있고 150g을 먹었다면, 1회 kcal에 80, 섭취 수량에 1.5를 넣으면 120kcal입니다. 무가당 차처럼 표시 열량이 0인 식품도 직접 추가할 수 있습니다.": [
    "If a yogurt label says 80kcal per 100g and you eat 150g, enter 80 as kcal per serving and 1.5 as quantity to record 120kcal. Foods labelled as 0kcal, such as some unsweetened teas, can also be added.",
    "ヨーグルトの表示が100gあたり80kcalで150g食べた場合、1回のkcalを80、数量を1.5にすると120kcalです。無糖茶など表示が0kcalの食品も手入力できます。",
    "酸奶标签写每100g含80kcal，吃了150g时，每份热量输入80、数量输入1.5，计入120kcal。标示0kcal的食品也可手动添加，例如部分无糖茶。"
  ],
  "추정식 원논문": [
    "Original equation paper",
    "推定式の原論文",
    "估算公式原论文"
  ],
  "식품 영양정보 확인하기": [
    "Look up food nutrition data",
    "食品の栄養情報を確認",
    "查询食物营养数据"
  ],
  "가격과 쿠폰은 0 이상, 할인율은 0~100%, 수량은 1~10,000의 정수로 입력해 주세요. 빈칸은 계산하지 않습니다.": [
    "Enter non-negative prices and coupons, discounts from 0 to 100%, and a whole quantity from 1 to 10,000. Empty fields are not calculated.",
    "価格・クーポンは0以上、割引率は0～100%、数量は1～10,000の整数で入力してください。空欄は計算しません。",
    "价格和优惠券须为非负数，折扣率为0～100%，数量为1～10,000的整数。空白不计算。"
  ],
  "나이는 19~100의 정수, 키는 100~250cm, 몸무게와 목표 체중은 30~300kg으로 입력해 주세요. 빈칸은 계산하지 않습니다.": [
    "Enter a whole age from 19 to 100, height from 100 to 250cm, and current and target weights from 30 to 300kg. Empty fields are not calculated.",
    "年齢は19～100の整数、身長は100～250cm、体重と目標体重は30～300kgで入力してください。空欄は計算しません。",
    "年龄输入19～100的整数，身高100～250cm，体重和目标体重30～300kg。空白不计算。"
  ],
  "섭취 수량은 0.01~10,000으로 입력해 주세요.": [
    "Enter a serving quantity from 0.01 to 10,000.",
    "摂取数量は0.01～10,000で入力してください。",
    "食用数量请输入0.01～10,000。"
  ],
  "검색 결과가 없습니다. 음식 이름을 바꾸거나 직접 추가해 주세요.": [
    "No food matches. Try another name or add a custom food.",
    "該当する食品がありません。検索名を変えるか手入力してください。",
    "未找到食物。请换个名称搜索或手动添加。"
  ],
  "직접 추가는 음식 이름과 0~100,000kcal, 올바른 섭취 수량이 필요합니다.": [
    "Custom foods need a name, 0–100,000kcal per serving and a valid quantity.",
    "手入力には食品名、0～100,000kcalと有効な摂取数量が必要です。",
    "手动添加需要食物名称、每份0～100,000kcal及有效数量。"
  ],
  "변환할 값은 0 이상 1,000,000,000,000,000 이하로 입력해 주세요. 빈칸은 계산하지 않습니다.": [
    "Enter a value from 0 to 1,000,000,000,000,000. Empty fields are not calculated.",
    "変換値は0～1,000,000,000,000,000で入力してください。空欄は計算しません。",
    "请输入0～1,000,000,000,000,000的数值。空白不计算。"
  ],
  "감량 계산 예시": [
    "Weight-loss calculation example",
    "減量の計算例",
    "减重计算示例"
  ],
  "증량 계산 예시": [
    "Weight-gain calculation example",
    "増量の計算例",
    "增重计算示例"
  ],
  "유지 추정값": [
    "Maintenance estimate",
    "維持推定値",
    "维持估算值"
  ],
  "계산 예시 ": [
    "Example estimate ",
    "計算例 ",
    "计算示例 "
  ],
  "계산 예시와 섭취량의 차이입니다.": [
    "This is the difference from the example estimate.",
    "計算例と摂取量の差です。",
    "这是计算示例与摄入量的差值。"
  ],
  "할인율 계산기 · NORI Tools": [
    "Discount Calculator · NORI Tools",
    "割引計算機 · NORI Tools",
    "折扣计算器 · NORI Tools"
  ],
  "단위 변환기 · NORI Tools": [
    "Unit Converter · NORI Tools",
    "単位変換 · NORI Tools",
    "单位换算器 · NORI Tools"
  ],
  "글자 수 세기 · NORI Tools": [
    "Character Counter · NORI Tools",
    "文字数カウント · NORI Tools",
    "字数统计 · NORI Tools"
  ],
  "칼로리 계산기 · NORI Tools": [
    "Calorie Calculator · NORI Tools",
    "カロリー計算機 · NORI Tools",
    "热量计算器 · NORI Tools"
  ]
});
