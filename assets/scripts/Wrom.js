"use strict";

const hft = require('hft');
const sampleUI = require('hft-sample-ui');
const PlayerNameManager = sampleUI.PlayerNameManager;

cc.Class({
    extends: cc.Component,

    properties: {
        display: cc.Sprite,
        level: 0,
        nameLabel: cc.Label,
        _map: null,
        _config: null,
        _netPlayer: null,
        _speed: 10,
        _eatTime: 3,
        _orientation: 0,
        _timer: 0,
        _moving: false,
        _inited: false,
        _playerNameManager: null
    },

    onLoad () {
        if (!this._map) {
            this._map = cc.find('Canvas/Map').getComponent('Map');
        }
        if (!this._config) {
            this._config = cc.find('Canvas').getComponent('Config');
        }
    },

    init (name, netPlayer, map) {
        this.nameLabel.string = name;
        this._netPlayer = netPlayer;
        this._playerNameManager = new PlayerNameManager(netPlayer);
        this._map = map;
        this._config = cc.find('Canvas').getComponent('Config');

        var rect = this._config.birthRect;
        this.node.x = rect.x + (Math.random() * rect.width) | 0;
        this.node.y = rect.y + (Math.random() * rect.height) | 0;

        this.initControl();
    },

    onEnable () {
        this.level = 0;
        this._speed = this._config.defaultSpeed;
        this._eatTime = this._config.eatTime;
        this._orientation = 0;
        this._moving = false;

        this.testControl();
        if (this._netPlayer && !this._inited) {
            this.initControl();
        }
    },

    onDisable () {
        this._netPlayer.removeAllListeners();
        this._inited = false;
    },

    initControl () {
        if (this._inited) {
            return;
        }

        var netPlayer = this._netPlayer;
        netPlayer.on('disconnect', this.handleDisconnection.bind(this));
        netPlayer.on('pad', this.handlePad.bind(this));
        netPlayer.on('abutton', function() {});
        netPlayer.on('show', this.handleShowMsg.bind(this));
        this._playerNameManager.on('setName', this.handleNameMsg.bind(this));
        // this.playerNameManager.on('busy', this.handleBusyMsg.bind(this));
        
        this._inited = true;
    },

    handlePad (event) {
        if (!event || isNaN(event.dir)) {
            this._moving = false;
            return;
        }
        if (event.dir >= 0) {
            if (!this._moving) {
                this._moving = true;
                this._timer = 0;
            }
            this._orientation = event.dir * 180 / 4;
        }
        else {
            this._moving = false;
        }
    },

    handleDisconnection (event) {
        console.log(event);
    },

    handleShowMsg (event) {
        console.log(event);
    },

    handleNameMsg (name) {
        if (name)
            this.nameLabel.string = name;
    },

    testControl () {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, function (event) {
            switch (event.keyCode) {
                case cc.KEY.up:
                this._orientation = 90;
                break;
                case cc.KEY.down:
                this._orientation = 270;
                break;
                case cc.KEY.left:
                this._orientation = 180;
                break;
                case cc.KEY.right:
                this._orientation = 0;
                break;
                default:
                this._moving = false;
                return;
            }
            if (!this._moving) {
                this._moving = true;
                this._timer = 0;
            }
        }, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, function (event) {
            this._moving = false;
        }, this);
    },

    // called every frame, uncomment this function to activate update callback
    update (dt) {
        if (this._moving) {
            var radian = Math.PI * this._orientation / 180;
            var dx = this._speed * Math.cos(radian);
            var dy = this._speed * Math.sin(radian);
            this.node.x += dx;
            this.node.y += dy;

            this._timer += dt;
            if (this._timer > this._eatTime) {
                this._map.eatBlock(this.node);
                this._timer = 0;
            }
        }
    },
});
