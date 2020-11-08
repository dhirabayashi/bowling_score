// ステータス
// 下記以外の理由でスコア未確定（まだ投げていない等）
const NOT_SCORE_DETERMINED = 0;
// ストライク発生によりスコア未確定
const STRIKE_OCCURRED = 1;
// スペア発生によりスコア未確定
const SPARE_OCCURRED = 2;
// スコア確定済み
const SCORE_DETERMINED = 3;
// 10フレーム目でスペアかストライクが起こった（スコアは確定）
const STRIKE_OR_SPARE_OCCURRED_AT_FRAME_TEN = 4;

// スプリット発生時の変換テーブル
// スプリットになりえないスコアの場合はチェックボックスを非活性にするので、ここには来ない
let table = {
    2: '②',
    3: '③',
    4: '④',
    5: '⑤',
    6: '⑥',
    7: '⑦',
    8: '⑧',                
};

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
        return this.status === SCORE_DETERMINED || this.status === STRIKE_OR_SPARE_OCCURRED_AT_FRAME_TEN;
    }

    // スコアを足す
    add(num) {
        if(this.isScoreDetermined()) {
            return;
        }

        this.num += num;

        // 表示用文字列も更新（記号が設定されている場合は足せないので変更なし）
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
    informStrikeOccurred(isFrame10) {
        if(isFrame10) {
            this.status = STRIKE_OR_SPARE_OCCURRED_AT_FRAME_TEN;
        } else {
            this.status = STRIKE_OCCURRED;
        }
        this.displayString = 'Ｘ';
    }

    // スペア発生を通知
    informSpareOccurred(isFrame10) {
        if(isFrame10) {
            this.status = STRIKE_OR_SPARE_OCCURRED_AT_FRAME_TEN;
        } else {
            this.status = SPARE_OCCURRED;
        }
        this.displayString = '／';
    }

    // 0点発生を通知
    informZeroPoint(selectIndex) {
        if(selectIndex === 0) {
            this.displayString = 'G';
        } else {
            this.displayString = '-';
        }
    }

    // ファール発生を通知
    informFoulOccurred() {
        this.displayString = 'F';
    }

    // スプリット発生を通知
    informSplitOccurred() {
        this.displayString = table[this.num];
    }

    // スプリット解除を通知
    informSplitCancelOccurred() {
        this.displayString = this.num;
    }
}