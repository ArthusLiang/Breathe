/*
 * @namespace   Breathe
 * @Author:     yulianghuang
 * @CreateDate  2013/8/6
 */
(function(window){
    var _breathe= {
        _guid: 0,
        getGuid: function () {
            return this._guid++;
        }
    };

    _breathe.Algorithm = {
        /*
         * search item in the array
         * @param {array}
         * @param {function} the match
         *  case -1 search the first part
         *  case 1 search the latter part
         *  default match the case
         * @return {obj}
         */
        binarySearch: function (pObj, pDelegate) {
            var _start = 0,
                _end = pObj.length - 1,
                _mid,
                _sign,
                _obj;
            while (_start <= _end) {
                _mid = (_start + _end) / 2 >> 0,
                    _obj = pObj[_mid],
                    _sign = pDelegate(_obj);
                if (_sign === 1) {
                    _start = _mid + 1;
                } else if (_sign === -1) {
                    _end = _mid - 1;
                } else {
                    return {
                        Index: _mid,
                        Value: _obj
                    }
                }
            }
            return null;
        }
    };

    /*
     * Class Event
     */
    _breathe.Event = function (pFunc, pPriority,pIsAsync) {
        this.Func = pFunc;
        this.Priority = pPriority || this.Level.Normal;
        this.Id = _breathe.getGuid();
        this.ThreadId=undefined;
        this.IsAsync=!!pIsAsync;
        //this.Args=[].slice.call(arguments, 2);
    };
    _breathe.Event.prototype = {
        attach: function (pThread) {
            pThread.add(this);
        },
        detach: function () {
            this.ThreadId && _breathe.Pool[this.ThreadId] && _breathe.Pool[this.ThreadId].remove(this);
        },
        exc: function (pCallBack) {
            if(this.IsAsync){
                this.Func.call(null,pCallBack);
            }else{
                this.Func();
                pCallBack();
            }
        },
        excute: function (pCallBack) {
            this.exc(pCallBack);
            this.detach();
        },
        Level:{
            High:1,
            AboveNormal:5,
            Normal:10,
            BellowNormal:15,
            Low:20
        }
    };

    //Thread Mode
    _breathe.Thread = function () {
        //Task Queue
        this.TQueue = {};
        //Prority Queue
        this.PQueue = [];
        //The Thread ID
        this.Id = _breathe.getGuid();
        //The Lock
        this.Lock = false;
    };
    _breathe.Thread.prototype = {
        /*
         * window.$e,_breathe.Event;
         * {
         *     Func:function(){},
         *     Priority:12,
         *     Id:12323,
         *     Args:[]
         * }
         */
        add: function (pEvent) {
            var _priority = pEvent.Priority;
            if (this.TQueue[_priority] === undefined) {
                this.PQueue.unshift(_priority);
                this.PQueue.sort();
                this.TQueue[_priority] = [];
            }
            this.TQueue[_priority].push(pEvent);
            pEvent.ThreadId = this.Id;
        },
        /*
         * remove an event
         * @param{event}
         */
        remove: function (pEvent) {
            var _priority = pEvent.Priority;
            for (var l = this.TQueue[_priority].length - 1; l !== -1; l--) {
                if (this.TQueue[_priority][l].ID === pEvent.ID) {
                    this.TQueue[_priority].splice(l, 1);
                    break;
                }
            }
            if (this.TQueue[_priority].length === 0) {
                var _index = _breathe.Algorithm.binarySearch(this.PQueue, function (pObj) {
                    return pObj === _priority ? 0 : (pObj < _priority ? 1 : -1);
                }).Index;
                this.PQueue.splice(_index, 1);
            }
            pEvent.ThreadId = undefined;
        },
        /*
         * fire
         */
        fire: function (pCallBack) {
            if (this.PQueue.length > 0 && !this.Lock) {
                this.Lock=true;
                var _priority = this.PQueue.shift(),
                    _toDo = this.TQueue[_priority].length;
                while (this.TQueue[_priority].length > 0) {
                    this.TQueue[_priority].shift().exc(function () {
                        _toDo--;
                        if (_toDo === 0) {
                            pCallBack && pCallBack();
                            this.Lock=false;
                        }
                    });
                }
            }
        }
    };

    _breathe.Pool=new function(){
        var _pool={};
        this.create=function(){
            var _t = new _breathe.Thread();
            _pool[_t.Id] = _t;
            return _t;
        };
        this.kill=function (pId) {
            delete _pool[pId];
            _pool[pId] = undefined;
        }
    };

    /*
     * contrl mode
     */
    _breathe.Listener=function(){
        this.Pool={};
        this.Option={};
    };
    _breathe.Listener.prototype={
        option:function(pOptions){
            var me =this;
            if (pOptions) {
                for (var name in pOptions) {
                    me.Option[name] = pOptions[name];
                }
            } else {
                return me.Option;
            }
        },
        unWatch:function () {
            var _ids = arguments;
            for(var _id in _ids){
                this.Pool[_ids[_id]]=undefined;
            }
        },
        watch:function(){
            var _threads = arguments;
            for(var _t in _threads){
                this.Pool[_threads[_t].Id]=_threads[_t];
            }
        },
        log:function(){

        },
        start:function(){},
        stop:function(){},
        pause:function(){}
    };

    _breathe.CPU=new function(){
        var _cpu= new _breathe.Listener(),
            _pool=_cpu.Pool,
            _clock,
            me=this,
            work = function (pTimeSpan) {
                var _timeSpan=_cpu.Option.StatisticsInterval* _cpu.Option.Interval,
                    _rate=pTimeSpan/_timeSpan;
                if(_rate< _cpu.Option.WorkRate){
                    for(var t in _pool){
                        _pool[t].PQueue.length>0 && _pool[t].fire();
                    }
                }
                _cpu.log(_rate);
            },
            stopInterval = function () { _clock && clearInterval(_clock); },
            startInterval=function(){
                var _lastTime= new Date(),
                    _timeSpan= 0,
                    _times=0;
                _clock=setInterval(function(){
                    _timeSpan+=new Date()-_lastTime;
                    _times++;
                    if(_times===_cpu.Option.StatisticsInterval){
                        work(_timeSpan);
                        _timeSpan=0;
                        _times=0;
                    }
                    _lastTime= new Date();
                },_cpu.Option.Interval);
            },
            stopTimeout=function(){
                _clock && clearTimeout(_clock);
            },
            startTimeout=function(){
                var me=this,
                    _lastTime,
                    _timeSpan=0,
                    _times= 0,
                    func=function(){
                        _lastTime= new Date();
                        _clock=setTimeout(function () {
                            _timeSpan += new Date() - _lastTime;
                            _times++;
                            if (_times === _cpu.Option.StatisticsInterval) {
                                work(_timeSpan);
                                _timeSpan=0;
                                _times=0;
                            }
                            func.call(me);
                        }, _cpu.Option.Interval);
                    };
                func();
            };
        _cpu.Option={
            Interval: 50,
            StatisticsInterval: 10,
            WorkRate: 1.5,
            SleepWait:60000,
            Mode:2 //1 interval  2 timeout
        };
        _cpu.start=function(){
            switch(_cpu.Option.Mode){
                case 2:startInterval.call(me);break;
                default:startTimeout.call(me);break;
            }
        };
        _cpu.stop=function(){
            _cpu.pause();
            for(var id in _pool){
                delete _pool[id];
            }
            _pool={};
        };
        _cpu.pause=function(){
            switch(_cpu.Option.Mode){
                case 2:stopInterval.call(me);break;
                default:stopTimeout.call(me);break;
            }
        };
        return _cpu;
    };

    _breathe.UserTrace=function(){

    };
    _breathe.UserTrace.prototype=function(){

    };

    //give quick reference
    window.$e = function (pFunc, pPriority) {
        return new _breathe.Event(pFunc, pPriority);
    };
    window.$pool=_breathe.Pool;
    window.$cpu =_breathe.CPU;
    window.Breathe=window.$b=_breathe;
})(window);