cc.Class({
    extends: cc.Component,

    properties: {
        defaultSpeed: 10,
        eatTime: 3,
        birthRect: cc.rect(),
        growRate: 1,
        beginGrow: 0.1,
        growCount: 10
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
