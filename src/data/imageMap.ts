// ─── 圖片靜態對應表 ─────────────────────────────────────────
// React Native 的 require() 必須是靜態字串，不能動態組合。
//
// ⚠️ 圖片重新命名規則（去掉括號）：
//   01minzu_(0).jpg → 01minzu_0.jpg
//   01minzu_(1).jpg → 01minzu_1.jpg
//   ...以此類推，共 90 張
//
// 圖片存放位置：assets/images/
// ──────────────────────────────────────────────────────────

type ImageKey = string;

const imageMap: Record<ImageKey, ReturnType<typeof require>> = {
  r01_0: require('../../assets/images/01minzu_0.jpg'),
  r01_1: require('../../assets/images/01minzu_1.jpg'),
  r01_2: require('../../assets/images/01minzu_2.jpg'),
  r02_0: require('../../assets/images/02pensuei_0.jpg'),
  r02_1: require('../../assets/images/02pensuei_1.jpg'),
  r02_2: require('../../assets/images/02pensuei_2.jpg'),
  r03_0: require('../../assets/images/03kuaiting_0.jpg'),
  r03_1: require('../../assets/images/03kuaiting_1.jpg'),
  r03_2: require('../../assets/images/03kuaiting_2.jpg'),
  r04_0: require('../../assets/images/04hong_0.jpg'),
  r04_1: require('../../assets/images/04hong_1.jpg'),
  r04_2: require('../../assets/images/04hong_2.jpg'),
  r05_0: require('../../assets/images/05sister_0.jpg'),
  r05_1: require('../../assets/images/05sister_1.jpg'),
  r05_2: require('../../assets/images/05sister_2.jpg'),
  r06_0: require('../../assets/images/06cy_0.jpg'),
  r06_1: require('../../assets/images/06cy_1.jpg'),
  r06_2: require('../../assets/images/06cy_2.jpg'),
  r07_0: require('../../assets/images/07chen_0.jpg'),
  r07_1: require('../../assets/images/07chen_1.jpg'),
  r07_2: require('../../assets/images/07chen_2.jpg'),
  r08_0: require('../../assets/images/08king_0.jpg'),
  r08_1: require('../../assets/images/08king_1.jpg'),
  r08_2: require('../../assets/images/08king_2.jpg'),
  r09_0: require('../../assets/images/09lou_0.jpg'),
  r09_1: require('../../assets/images/09lou_1.jpg'),
  r09_2: require('../../assets/images/09lou_2.jpg'),
  r10_0: require('../../assets/images/10tong_0.jpg'),
  r10_1: require('../../assets/images/10tong_1.jpg'),
  r10_2: require('../../assets/images/10tong_2.jpg'),
  r11_0: require('../../assets/images/11guoZong_0.jpg'),
  r11_1: require('../../assets/images/11guoZong_1.jpg'),
  r11_2: require('../../assets/images/11guoZong_2.jpg'),
  r12_0: require('../../assets/images/12dongXin_0.jpg'),
  r12_1: require('../../assets/images/12dongXin_1.jpg'),
  r12_2: require('../../assets/images/12dongXin_2.jpg'),
  r13_0: require('../../assets/images/13ding_0.jpg'),
  r13_1: require('../../assets/images/13ding_1.jpg'),
  r13_2: require('../../assets/images/13ding_2.jpg'),
  r14_0: require('../../assets/images/14guoDaya_0.jpg'),
  r14_1: require('../../assets/images/14guoDaya_1.jpg'),
  r14_2: require('../../assets/images/14guoDaya_2.jpg'),
  r15_0: require('../../assets/images/15hongGuan_0.jpg'),
  r15_1: require('../../assets/images/15hongGuan_1.jpg'),
  r15_2: require('../../assets/images/15hongGuan_2.jpg'),
  r16_0: require('../../assets/images/16dongHe_0.jpg'),
  r16_1: require('../../assets/images/16dongHe_1.jpg'),
  r16_2: require('../../assets/images/16dongHe_2.jpg'),
  r17_0: require('../../assets/images/17xing_0.jpg'),
  r17_1: require('../../assets/images/17xing_1.jpg'),
  r17_2: require('../../assets/images/17xing_2.jpg'),
  r18_0: require('../../assets/images/18heping_0.jpg'),
  r18_1: require('../../assets/images/18heping_1.jpg'),
  r18_2: require('../../assets/images/18heping_2.jpg'),
  r19_0: require('../../assets/images/19jianDan_0.jpg'),
  r19_1: require('../../assets/images/19jianDan_1.jpg'),
  r19_2: require('../../assets/images/19jianDan_2.jpg'),
  r20_0: require('../../assets/images/20sun_0.jpg'),
  r20_1: require('../../assets/images/20sun_1.jpg'),
  r20_2: require('../../assets/images/20sun_2.jpg'),
  r21_0: require('../../assets/images/21yai_0.jpg'),
  r21_1: require('../../assets/images/21yai_1.jpg'),
  r21_2: require('../../assets/images/21yai_2.jpg'),
  r22_0: require('../../assets/images/22penYuan_0.jpg'),
  r22_1: require('../../assets/images/22penYuan_1.jpg'),
  r22_2: require('../../assets/images/22penYuan_2.jpg'),
  r23_0: require('../../assets/images/23hongZong_0.jpg'),
  r23_1: require('../../assets/images/23hongZong_1.jpg'),
  r23_2: require('../../assets/images/23hongZong_2.jpg'),
  r24_0: require('../../assets/images/24guoWen_0.jpg'),
  r24_1: require('../../assets/images/24guoWen_1.jpg'),
  r24_2: require('../../assets/images/24guoWen_2.jpg'),
  r25_0: require('../../assets/images/25zheng_0.jpg'),
  r25_1: require('../../assets/images/25zheng_1.jpg'),
  r25_2: require('../../assets/images/25zheng_2.jpg'),
  r26_0: require('../../assets/images/26che_0.jpg'),
  r26_1: require('../../assets/images/26che_1.jpg'),
  r26_2: require('../../assets/images/26che_2.jpg'),
  r27_0: require('../../assets/images/27xia2_0.jpg'),
  r27_1: require('../../assets/images/27xia2_1.jpg'),
  r27_2: require('../../assets/images/27xia2_2.jpg'),
  r28_0: require('../../assets/images/28penXin_0.jpg'),
  r28_1: require('../../assets/images/28penXin_1.jpg'),
  r28_2: require('../../assets/images/28penXin_2.jpg'),
  r29_0: require('../../assets/images/29ade_0.jpg'),
  r29_1: require('../../assets/images/29ade_1.jpg'),
  r29_2: require('../../assets/images/29ade_2.jpg'),
  r30_0: require('../../assets/images/30xin_0.jpg'),
  r30_1: require('../../assets/images/30xin_1.jpg'),
  r30_2: require('../../assets/images/30xin_2.jpg'),
};

export default imageMap;

export function getImage(key: string): ReturnType<typeof require> | null {
  try {
    return imageMap[key] ?? null;
  } catch {
    return null;
  }
}
