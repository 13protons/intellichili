$(function() {
        
	//global chili object
        var chili = {
			timer: {
				setpoint: 0,
				value: 0,
				elapsed: 0,
				interval: null,
				started: null,
				active: false,
				finished: 'off',
				display: "0:00.00",
				increment_by: 1000 * 60 * 5, /* 5 min */
				limit: 1000 * 60 * 60 * 12 /* 12 hrs */
			},
			on: false,
			temp: 'warm'
		}
	//merge with remote state
		
	updateUI();
	
	//toggle heating power
		$(".heat a").click(function(){
			chili.temp = $(this).data('temp');
			console.log("Set to: ", chili.temp);
			//trigger change in temperture here
			
			updateUI();
		});
	
	//toggle on/off
		$('.status a').click(function(){
			var status = $(this).data('value');
			
			if(status == 'on'){chili.on = true;}
			else {chili.on = false;}
			
			console.log("Turn cooker: ", chili.on);
			//toggle on/off state here
			
			updateUI();
			
		});
	//timer_done_action
		$("#timer_done_action").on('change', function(){
			chili.timer.finished = $(this).val();
			console.log("when done: ", $(this).val());
			
			//when user changed dropdown for what to do when timer finishes
			
		});
	
	//timer 
		$(".timer_more").click(function(){
			//increment timer setpoint
			chili.timer.setpoint += chili.timer.increment_by;
			//make sure setpoint is w/in bounds
			if(chili.timer.setpoint > chili.timer.limit){chili.timer.setpoint = chili.timer.limit;}
			
			//save timer state to server
			
			updateTime();
		});
		
		$(".timer_less").click(function(){
			//increment timer setpoint
			chili.timer.setpoint -= chili.timer.increment_by;
			//make sure setpoint is w/in bounds
			if(chili.timer.setpoint < 0){chili.timer.setpoint = 0;}
			
			//save timer state to server
			
			updateTime();
		});
	
		$(".timer_toggle").click(function(){
			if(chili.timer.active){
				//stop timer;
				//change setpoint to setpoint - (now - start)
				chili.timer.active = false;
				clearInterval(chili.timer.interval);
			}else {
				//start timer
				chili.timer.active = false;
				if(chili.timer.setpoint > 0){
					var d = new Date();
					chili.timer.active = true;
					chili.timer.started = d.valueOf();
					console.log("Timer active: ", chili.timer.active);
					
					updateTime();
					chili.timer.interval = setInterval(updateTime, 1000);
				}
			}
			
			updateUI();
		});
	
		$(".timer_reset").click(function(){
			timerEnd();
		});
	
		function timerEnd(how){
			if (typeof how === 'undefined') how = false;
			if(how == "expired"){
				//run finished action 
				chili.temp = chili.timer.finished;
			}
			chili.timer.active = false;
			clearInterval(chili.timer);
			$.extend(chili.timer, {
				setpoint: 0,
				value: 0,
				elapsed: 0,
				interval: null,
				started: null,
				active: false,
				display: "0:00.00"
			});
			
			updateTime();
			updateUI();
		}
	
		function updateTime(){
			if(chili.timer.active){
				var d = new Date();
				chili.timer.elapsed = d.valueOf() - chili.timer.started;
				console.log("elapsed: ", chili.timer.elapsed);
				if(chili.timer.elapsed > chili.timer.setpoint){
					timerEnd('expired');
				}else{
					chili.timer.value = chili.timer.setpoint - chili.timer.elapsed;
				}
				showTime(chili.timer.value);
			}else{
				if(chili.timer.setpoint > 0){
					showTime(chili.timer.setpoint);	
				}
			}
			
			function showTime(t){
				if(t > 0){
				   var hbase10 = t / (1000 * 60 * 60);
				   var hours = Math.floor(hbase10);
				   var mbase10 = ((hbase10 - hours) * 60)
				   var min = Math.floor(mbase10);
				   var sec = parseInt((mbase10 - min) * 60);
				   
				   if(sec < 10){sec = "0" + sec;}
				   if(min < 10){min = "0" + min;}
				   
				   $("#time_show .seconds").html(sec);
				   $("#time_show .minutes").html(min);
				   $("#time_show .hours").html(hours);
				   
				   if(min < 10){min = "0" + min;}
				   var time = hours + ":" + min;
						chili.timer.display = time;	
						//$(".timer_show").html(time);
				   }
			}
		}
	
		
	//separate button display logic
		function updateUI(){
			//timer start/stop button
			if(chili.timer.active){
					$(".timer_toggle").addClass('running'); 
			}
			else {$(".timer_toggle").removeClass('running'); }
			
			//status toggle
			$('.status a').removeClass('active');
			if(chili.on){ $('.status_on').addClass('active'); }
			else { $('.status_off').addClass('active'); }
			
			//temps
			$(".heat a").each(function(){
				if($(this).data('temp') == chili.temp){
					$(this).addClass('active');
				}else {
					$(this).removeClass('active');
				}
			});
			
		}
	
});