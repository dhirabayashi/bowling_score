// ステータス
// 下記以外の理由でスコア未確定（まだ投げていない等）
const NOT_SCORE_DETERMINED = 0;
// ストライク発生によりスコア未確定
const STRIKE_OCCURRED = 1;
// スペア発生によりスコア未確定
const SPARE_OCCURRED = 2;
// スコア確定済み
const SCORE_DETERMINED = 3;

// スコアの抽象表現
class Score {
    constructor() {
        this.num = 0;
        this.displayString = '';
        this.status = NOT_SCORE_DETERMINED;
    }

    // スコアの数値表現
    intValue() {
        return this.num;
    }

    // スコアが確定しているかどうか
    isScoreDetermined() {
        return this.status === SCORE_DETERMINED;
    }

    // スコアを足す
    add(num) {
        if(this.isScoreDetermined()) {
            return;
        }

        this.num += num;

        // 表示用文字列も更新（記号が設定されている場合は足せないので変更なし）
        // TODO 一度ストライクやスペアが発生した後にやり直す場合の考慮がない（それはできないという仕様でもいいかもしれないが）
        if(this.displayString === '' || Number.isInteger(parseInt(this.displayString, 10))) {
            this.displayString = this.num.toString();
        }
    }

    // スコアの文字列表現
    toString() {
        return this.displayString;
    }

    // スコア確定を通知
    informScoreDetermined() {
        this.status = SCORE_DETERMINED;
    }

    // ステータスを取得
    getStatus() {
        return this.status;
    }

    // ストライク発生を通知
    informStrikeOccurred() {
        this.displayString = 'Ｘ';
        this.status = STRIKE_OCCURRED;
    }

    // スペア発生を通知
    informSpareOccurred() {
        this.displayString = '／';
        this.status = SPARE_OCCURRED;
    }
}