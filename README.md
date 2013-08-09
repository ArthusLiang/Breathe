Breathe
=======

Breathe.js is a function-oriented javascript frame.You can create threads with breathe.js.The most exciting thing is that you can decide when to run your function by the cpu running rate.
  
Set Up
=======

*Just use it*

    <script src="breathe2.0.js" type="text/javascript"><script>

Quick Start
=======

## Event ##

###Explanation####

>Create an event. The event will contain the function needs to be ran. It's the basic unit.

###Arguments###

>@param {function} function

>@param {number|null} priority

>@param {bool|null} is Async?

###Method###
>**attach** ------ attach the event to a thread

>**detach**  ------ detach the event from it's thread

>**exc** ----------- run the function in the event

>**excute** ------- run the function in the event and detach the event from it's thread after running

###Create an instance###

*create an event*
    
	$e(function(){
		//...
	    var a=1;
		//...	
	},20);

*create an event (async),you should call the callback function in your main function*

	$e(function(pCallback){
		Combine.ajax("...","",function(data){
			//...
		    //do some thing
			//...
			pCallback(data);
		});
	},20,true);

###attach###

	var _thread = $pool.create(), //create a thread in the thread pool
		_event = $e(function(){
			//coding
		}); 
	_event.attach(_thread);

###detach###
	_event.detach(_thread);

###exc###
	_event.exc();

###excute###
	_event.excute();


## Thread ##

###Explanation####

>Create an instance of thread. You add Event to Thread,and add Thread to Listener.

###Method###
>**add** -------- add an instance of Event to the thread

>**remove**	--- remove an instance of Event from the thread

>**fire** --------- excute a list of Events on the top of priority stack

###Create an instance###

create an instance of thread 

	var _thread = new $b.Thread();

create an instance of thread in the breathe pool

	var _thread = $pool.create();

###add###
	var _thread = $pool.create(), //create a thread in the thread pool
		_event = $e(function(){
			//coding
		}); 
	_thread.add(_event);

###remove###
	_thread.remove(_event);

###fire###
    var _thread = $pool.create();
	for（var l=21;l!==0;l--）{
		(function(l){
			_thread.add($e(function(){
				alert(l);
			}),l/2>>>0);
		})(l);
	}
	_thread.fire(); //21,20
	_thread.fire(); //19.18


## CPU ##

###Explanation####

>Cpu is a static instance of Listener.It will watch the using rate of cpu and fire the threads in it's thread pool by condition.

###Option###
You need to set it before start the CPU.*(default value)*

>**Interval** ------------------- (50)how often to test the using rate of cpu

>**StatisticsInterval** ------- (10)the interval times to check the rate

>**WorkRate** ----------------- (1.5)below this rate ,the thread in the pool will be fired

>**SleepWait** ----------------- (60000)the cpu will be stopped 'SleepWait' milliseconds after the pool is Empty

>**Mode** ----------------------- (2)1 interval  2 timeout 

###Method###
>**option** ----------- set or get the option of the cpu (inherited from Listener)

>**unWatch** -------- remove threads from the cpu's thread pool(inherited from Listener)

>**watch** ------------ add threads into the cpu's thread pool(inherited from Listener)

>**log** ---------------- log the info when check the rate (you can override it)

>**start** -------------- start to check the rate and fire the threads(override the Listener)

>**stop**	-------------- pause and clear the thread pool(override the Listener)

>**pause** ------------ stop checking the rate and firing the threads(override the Listener)

###option###
set the option

	$cpu.option({
		Interval:50,
		StatisticsInterval:10
	})

get the option

	$cpu.option()
    /*
	return {
	    Interval: 50,
        StatisticsInterval: 10,
        WorkRate: 1.5,
        SleepWait:60000,
        Mode:2
	}
    */

###unWatch###

	var e1=$e(function(){}),
		e2=$e(function(){});
	$cpu.watch(e1,e2);
	$cpu.unwatch(e1,e2);

###watch###
	var e1=$e(function(){}),
		e2=$e(function(){});
	$cpu.watch(e1,e2);
###log###
	$cpu.log=function(pRate){

	};
###start###
	$cpu.start();
###stop###
	$cpu.stop();
###pause###
	$cpu.pause();
License
=======


Contributing
=======

