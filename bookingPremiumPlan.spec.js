// bookingPremiumPlan.spec.js
// WebdriverIO (v8+) + Mocha で記述した E2E テスト
// 課題1: プレミアム会員がテーマパーク優待プランを予約し、完了ポップアップが表示されることを検証する

import { expect } from '@wdio/globals';

// テストサイトのベース URL
const BASE_URL = 'https://hotel.testplanisphere.dev/ja/';

// ★ デモ用に決め打ちするテストデータ
const TEST_DATA = {
  email: 'ichiro@example.com',            // プレミアム会員
  password: 'password',
  stayDate: '2025-07-15',                // YYYY-MM-DD (input type=date 用)
  nights: '3',                           // select 要素 value
  headCount: '2',                        // select 要素 value
  tel: '00011112222',
};

/**
 * ログイン処理をまとめたヘルパー
 */
async function loginAsPremiumMember () {
  await browser.url(BASE_URL);
  await $('a=ログイン').click();
  await $('#email').setValue(TEST_DATA.email);
  await $('#password').setValue(TEST_DATA.password);
  await $('button=ログイン').click();
  await expect($('h1')).toHaveTextContaining('マイページ');
}

/**
 * 宿泊予約画面でフォームを入力するヘルパー
 */
async function fillBookingForm () {
  // 宿泊日
  await $('#date').setValue(TEST_DATA.stayDate);
  // 宿泊数
  await $('#term').selectByAttribute('value', TEST_DATA.nights);
  // 人数
  await $('#head-count').selectByAttribute('value', TEST_DATA.headCount);
  // 追加プラン: 朝食バイキング
  await $('#breakfast').click();
  // 連絡手段: 電話
  await $('#contact').selectByAttribute('value', 'tel');
  // 電話番号
  await $('#tel').setValue(TEST_DATA.tel);
}

/**
 * 期待される合計金額を計算する関数 (画面ロジックに合わせて調整してください)
 */
function calcExpectedTotal () {
  const basePrice = 15000;   // テーマパーク優待プラン(1泊 1人)
  const breakfast = 1000;    // 朝食バイキング(1泊 1人)
  const nights = Number(TEST_DATA.nights);
  const people = Number(TEST_DATA.headCount);
  return (basePrice + breakfast) * nights * people;
}

// ============= テスト本体 =============

describe('課題1: プレミアム会員の宿泊予約シナリオ', () => {
  before(async () => {
    // ウィンドウサイズを固定 (レイアウト差異を避けるため)
    await browser.setWindowSize(1280, 800);
  });

  it('テーマパーク優待プランを正しく予約できる', async () => {
    // 1. プレミアム会員でログインする
    await loginAsPremiumMember();

    // 2. 「宿泊予約」ボタンをクリック
    await $('a=宿泊予約').click();

    // 3. テーマパーク優待プランの「このプランで予約」ボタンをクリック
    const planBtn = $('//th[contains(text(),"テーマパーク優待プラン")]/ancestor::tr//a[contains(. ,"このプランで予約")]');
    await planBtn.click();

    // 4. フォーム入力
    await fillBookingForm();

    // 5. 表示された合計金額が期待値と一致することを検証
    await browser.pause(300); // 計算反映待ち（アニメーション対策が必要な場合は適宜置換）
    const displayedTotal = await $('#total-bill').getText(); // 例: "¥96,000"
    const expected = `¥${calcExpectedTotal().toLocaleString()}`;
    await expect(displayedTotal).toEqual(expected);

    // 6. 「予約内容を確認する」をクリック
    await $('button=予約内容を確認する').click();

    // 7. 確認画面の各項目が正しいことを検証
    await expect($('#date')).toHaveText('2025/07/15');
    await expect($('#term')).toHaveText('3');
    await expect($('#head-count')).toHaveText('2');
    await expect($('#plan')).toHaveTextContaining('朝食バイキング');
    await expect($('#contact')).toHaveText('電話でのご連絡');
    await expect($('#tel')).toHaveText(TEST_DATA.tel);

    // 8. 「この内容で予約する」をクリック
    await $('button=この内容で予約する').click();

    // 9. 完了ポップアップの表示を検証
    const modal = $('.modal-card-body');
    await expect(modal).toBeDisplayed();
    await expect(modal).toHaveTextContaining('予約を完了しました');

    // 10. 「閉じる」をクリック
    await $('button=閉じる').click();

    // 11. 宿泊予約画面に戻ることを確認
    await expect(browser).toHaveUrlContaining('/reserve.html');
  });
});
