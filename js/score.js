// Fはファール
let options = ['', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'F'];

new Vue({
    el: '#app',
    data() {
        let frames = [];
        for(let i = 0; i < 10; i++) {
            // 10フレームだけ3投目がありうる
            let count = i === 9 ? 3 : 2;
            let frame = {};

            // フレーム番号
            frame.num = i + 1;
            // スコア入力用プルダウン
            let selectBoxes = [];
            for(let j = 0; j < count; j++) {
                // 初期状態は1フレーム目の1投目だけ活性
                let disabled = i !== 0 || j !== 0;
                selectBoxes.push({ options: options, disabled: disabled });
            }
            frame.selectBoxes = selectBoxes;

            // スコア
            let scores = [];
            for(let j = 0; j < count; j++) {
                scores.push(new Score());
            }
            frame.scores = scores;

            // スプリットかどうか
            frame.splits = []
            // 10フレームは1〜3の全てでスプリットの可能性がある
            let splitCount = 1;
            if(i === 9) {
                splitCount = 3;
            }
            for(let j = 0; j < splitCount; j++) {
                frame.splits.push({ checked: false, disabled: true });
            }

            frames.push(frame);
        }
        return {
            frames: frames
        };
    },
    methods: {
        // プルダウンでスコアが選択された際にスコアの計算やUIの変更などを行う
        changeScore(frameIndex, selectIndex, event) {
            // スペアが発生していた箇所のスコアを確定可能かどうか
            function canDetermineScoreAtPrevious(_this) {
                // この関数の中でthisを直接使うと想定と違うオブジェクトを指してしまうため、引数で受け取る
                return frameIndex >= 1 && selectIndex === 1
                    && _this.frames[frameIndex-1].scores[0].getStatus() === STRIKE_OCCURRED;
            }

            // スペアが発生していた箇所のスコアを確定可能かどうか
            function canDetermineScoreAtTwoPrevious(_this) {
                return frameIndex >= 2 && selectIndex == 0
                    && _this.frames[frameIndex-2].scores[0].getStatus() === STRIKE_OCCURRED
                    && _this.frames[frameIndex-1].scores[0].getStatus() === STRIKE_OCCURRED;
            }

            // 残りピン数に応じて、プルダウンの状態を変える
            function changeSubsequentPullDown(_this, frameIndex, selectIndex, value) {
                // フレーム内で後続のプルダウンがなかったら何もする必要はない
                if((frameIndex !== 9 && selectIndex === 1) || (frameIndex === 9 && selectIndex === 2)) {
                    return;
                }

                // ストライクだったら何もする必要はない（10フレームを除く）
                let score = _this.frames[frameIndex].scores[selectIndex];
                if(score.getStatus() === STRIKE_OCCURRED && frameIndex !== 9) {
                    return;
                }

                if(value === '') {
                    _this.frames[frameIndex].selectBoxes[selectIndex+1].disabled = true;
                    _this.frames[frameIndex].selectBoxes[selectIndex+1].options = options;
                } else if(value === 'F') {
                    _this.frames[frameIndex].selectBoxes[1].disabled = false;
                } else {
                    // 合計スコアが10を超えないように二投目のプルダウンで選択可能な値を絞る
                    let trancated_options = [];
                    // プルダウンには空文字とFの2つの数値ではない要素があるので、その分を引いている
                    let length = options.length - value - 2;
                    for(let i = 0; i < length; i++) {
                        trancated_options.push(i);
                    }
                    trancated_options.unshift('');
                    trancated_options.push('F');
                    _this.frames[frameIndex].selectBoxes[selectIndex+1].options = trancated_options;

                    // どのフレームでも2投目は無条件で活性化
                    _this.frames[frameIndex].selectBoxes[1].disabled = false;

                    // 10フレームの場合の特別な考慮
                    if(frameIndex === 9) {
                        let firstScoreInFrame = _this.frames[frameIndex].scores[0];
                        // ストライクかスペアが発生した場合は3投目の解禁とピンの再配置が必要
                        if(selectIndex === 1) {
                            // ストライクが起こっていた場合
                            if(firstScoreInFrame.getStatus() === STRIKE_OR_SPARE_OCCURRED_AT_FRAME_TEN) {
                                _this.frames[frameIndex].selectBoxes[2].disabled = false;
                            }
                            // スペアが起こった場合
                            if(score.getStatus() === STRIKE_OR_SPARE_OCCURRED_AT_FRAME_TEN) {
                                _this.frames[frameIndex].selectBoxes[2].disabled = false;
                                _this.frames[frameIndex].selectBoxes[2].options = options;
                            }
                        // 1投目がストライクだった場合は2投目のピン再配置
                        } else if(selectIndex === 0 && firstScoreInFrame.getStatus() === STRIKE_OR_SPARE_OCCURRED_AT_FRAME_TEN) {
                            _this.frames[frameIndex].selectBoxes[1].options = options;
                        }
                    }
                }
            }

            let value = event.target.value;
            let intValue = parseInt(value, 10);
            if(!Number.isInteger(intValue)) {
                intValue = 0;
            }

            // スコアの設定
            let score = this.frames[frameIndex].scores[selectIndex];
            score.add(intValue);

            // スペア
            if(selectIndex === 1
                    && (this.frames[frameIndex].scores[selectIndex-1].intValue() + score.intValue() === 10)) {

                // 10フレームの場合、1投目がストライクだったらスペアではない
                if(frameIndex === 9) {
                    if(this.frames[frameIndex].scores[selectIndex-1]
                        .getStatus() !== STRIKE_OR_SPARE_OCCURRED_AT_FRAME_TEN) {
                        
                        score.informSpareOccurred(frameIndex === 9);
                    }
                } else {
                    score.informSpareOccurred(frameIndex === 9);
                }
            // ストライク
            } else if((selectIndex === 0 || frameIndex === 9) && intValue === 10) {
                score.informStrikeOccurred(frameIndex === 9);
            } else {
                score.informScoreDetermined();
            }
            // プルダウンで値が選択された場合、値に応じて後続のプルダウンの状態を変える
            changeSubsequentPullDown(this, frameIndex, selectIndex, value);

            // 2フレーム以降は、前にストライクやスペアが起きていてスコア未確定の可能性がある
            // 一つ前のフレームのストライクのスコアを決定できる場合
            if(canDetermineScoreAtPrevious(this)) {                
                this.frames[frameIndex-1].scores[0].add(this.frames[frameIndex].scores[0].intValue() + intValue);
                this.frames[frameIndex-1].scores[0].informScoreDetermined();
                this.frames[frameIndex-1].scores[1].informScoreDetermined();                
            }

            // 二つ前のフレームのストライクのスコアを決定できる場合（ストライクが続いた場合に発生）
            if(canDetermineScoreAtTwoPrevious(this)) {                
                this.frames[frameIndex-2].scores[0].add(this.frames[frameIndex-1].scores[0].intValue() + intValue);
                this.frames[frameIndex-2].scores[0].informScoreDetermined();
                this.frames[frameIndex-2].scores[1].informScoreDetermined();                
            }

            // 一つ前のスペアのスコアを決定できる場合
            if(frameIndex >= 1 && selectIndex === 0
                    && this.frames[frameIndex-1].scores[1].getStatus() === SPARE_OCCURRED) {
                
                this.frames[frameIndex-1].scores[1].add(intValue);
                this.frames[frameIndex-1].scores[1].informScoreDetermined();                
            }

            // ピンが一本も倒れなかった場合の表示文字列の対応
            if(intValue === 0) {
                let index = selectIndex;
                // 10フレーム3投目の対応
                if(frameIndex === 9 && selectIndex === 2) {
                    if(this.frames[frameIndex].scores[selectIndex-1].getStatus()
                            === STRIKE_OR_SPARE_OCCURRED_AT_FRAME_TEN) {
                        index = 0;
                    } else {
                        index = 1;
                    }
                }
                score.informZeroPoint(index);
            }

            // ファールの場合の表示文字列の対応
            if(value === 'F') {
                score.informFoulOccurred();
            }

            // 入力が終わったら非活性化し、次を活性化する
            this.frames[frameIndex].selectBoxes[selectIndex].disabled = true;
            if(frameIndex !== 9 && (selectIndex === 1 || score.getStatus() === STRIKE_OCCURRED)) {
                this.frames[frameIndex+1].selectBoxes[0].disabled = false;
            }

            // スプリットのチェックボックスの制御
            // 1投目がストライクじゃなかったら2投目はスプリットになり得ない（1投目でスペアはあり得ないので区別しなくていい）
            function isNotStrikeOccurredAtFirst(_this) {
                return selectIndex === 1 && _this.frames[frameIndex].scores[selectIndex-1].getStatus() !== STRIKE_OR_SPARE_OCCURRED_AT_FRAME_TEN;
            }
            // 2投目がスペアでもストライクでもなかったら3投目はスプリットになりえない
            function isNotSpareAndStrikeOccurredAtSecond(_this) {
                return selectIndex === 2 && _this.frames[frameIndex].scores[selectIndex-1].getStatus() !== STRIKE_OR_SPARE_OCCURRED_AT_FRAME_TEN;
            }

            // 10フレーム目の考慮
            if(frameIndex === 9 && (isNotStrikeOccurredAtFirst(this) || isNotSpareAndStrikeOccurredAtSecond(this))) {
                return;
            }
            // スプリットは倒れたピンの数が2〜8でないと発生し得ない（2本倒れただけでスプリットはまずあり得ないが、可能性はゼロではない）
            if(2 <= intValue && intValue <= 8 ) {
                this.frames[frameIndex].splits[selectIndex].disabled = false;
            }
        },
        // 合計スコアを計算して返す
        calcTotalScore(frameIndex) {
            let totalScore = 0;
            for(let i = 0; i <= frameIndex; i++) {
                for(let j = 0; j < this.frames[i].scores.length; j++) {
                    let score = this.frames[i].scores[j];
                    // 一つでもスコア未確定なら何も表示しない
                    if(!score.isScoreDetermined()) {
                        // ただし10フレームの3投目が非活性な場合は表示する
                        if(i !== 9 || j !== 2 || !this.frames[i].selectBoxes[j].disabled) {
                            return '';
                        }
                    }
                    totalScore += score.intValue();
                }
            }
            return totalScore;
        },
        // splitのチェックボックスが変更された際にスプリットの表示や解除を行う
        changeSplitCheckbox(frameIndex, splitIndex) {
            let checked = this.frames[frameIndex].splits[splitIndex].checked;
            let score = this.frames[frameIndex].scores[splitIndex];

            if(checked) {
                score.informSplitOccurred();
            } else {
                score.informSplitCancelOccurred();
            }
        }
    },
    computed: {
        isDisabled: function() {
            return function(i, j) {
                return this.frames[i].selectBoxes[j].disabled;
            }
        }
    }
});
