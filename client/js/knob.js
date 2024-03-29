/**
* @author: Andrew Karasekv
* Dynamically change values and the user interface when spinning the knob on the console.
* Code reference: Andrew Karasek. Dope Knobs #2 - Two Way Knob. Retrieved from https://codepen.io/prythm/
*/

/* global HTMLElement newPos Event $*/

var tagBase = "knob";
var newElms = ["input","face", "hand"];
newElms.forEach(function(newElm){
          
          document.registerElement(tagBase + "-" + newElm, {
					  prototype: Object.create(HTMLElement.prototype)
					});
        });

function rangeKnob(elm, progWidth, progColor, className) {

  			var focused = null;
  			var mouse = {};
  			var speed =  1;
				var minVal, maxVal, min, max, degRange, valRange, rosetta, label, step, startingValue;
  
  			if(!className){
          className= "";
        }
  
  			for(var i = 0; i<elm.length; i++){
          
            var node = elm[i];

          	step = node.getAttribute("step");
            maxVal = node.max;
            minVal = node.min;
            min = node.getAttribute("data-degree-offset");
          
            degRange = node.getAttribute("data-degree-range");
            max = parseInt(min) + parseInt(degRange);
            valRange = maxVal- minVal;
            rosetta = degRange / valRange;
						startingValue = node.getAttribute("value");	
  
            var parent = node.parentNode;
            var sibling = node.nextSibling;   	
            var wrapper = document.createElement("div");
            var knob = document.createElement(tagBase + "-input");
          	knob.className = "knobInput " + className + " "+ node.className;
                    	node.className = node.className + " hidden";
            var face = document.createElement(tagBase + "-face");
          	face.className = "knobInput-face";
           	
            rotate(face, min);
            
          	var label = document.createElement("label");
         		label.className = "knobInput-label";
            var progress = document.createElement("canvas");

          progress.className = "knob-progress";
          label.innerHTML = node.value;
          knob.setAttribute("data-original-element", node.id);
          knob.setAttribute("data-rosetta", rosetta);
          knob.setAttribute("min", minVal);
          var hand = document.createElement(tagBase + "-hand");

          knob.appendChild(face);
          knob.appendChild(progress);
					knob.appendChild(label);
          face.appendChild(hand);
					knob.appendChild(node);
                
          if(sibling){
            parent.insertBefore(knob, sibling)
          } else{
            parent.appendChild(knob);
          }
          
          if(startingValue){
            	var degrees = (startingValue - minVal) * rosetta;
							degrees = parseInt(degrees) + parseInt(min);
            	rotate(face, degrees);
             
              var rad = parseInt(getCSS(face, "width"))/ 2;
            }

          knob.addEventListener("mousedown", function(e){
              focused = this;
              mouse.clickPos = e.pageY;
              mouse.lastPos = e.pageY;
							document.body.className += "noSelection";
          });

    		document.addEventListener("mousemove", function(e){
					if(focused){
            if(!mouse.lastPos){
							mouse.lastPos = mouse.clickPos;
            }
             var originalNode = focused.childNodes[3];
            var min = originalNode.getAttribute("data-degree-offset");
						var degRange = originalNode.getAttribute("data-degree-range");
            var max = parseInt(min) + parseInt(degRange);
            
          	newPos = e.pageY;
            var diff = (mouse.lastPos - newPos) * speed;
            var rot = focused.firstChild.style.transform || 0; 
         		if(rot !== 0){
              rot=parseInt(rot.replace("rotate(", "").replace("deg)", ""));
            }
						var newRot = rot + diff * speed;  
            if(newRot < min){
              newRot = min;
            }
            if(newRot > max){
              newRot = max;
            }
            var newVal = (newRot-min) / focused.getAttribute("data-rosetta") + parseInt(focused.getAttribute("min"));
           	var step = originalNode.getAttribute("step");
           	var stepped = (~~(newVal/step) * step);
         		var lastVal = originalNode.value;
            originalNode.value = stepped;
        		
        		var rad = parseInt(getCSS(focused.firstChild, "width"))/ 2;
            
            if(stepped == minVal){
              clearCanvas(focused.firstChild.nextSibling);
            } else{
                drawArc(focused.firstChild.nextSibling, rad * 2, newRot, min, progWidth, progColor);
            }
                    
            rotate(focused.firstChild, newRot);
            
            focused.childNodes[2].innerHTML = stepped;
        		mouse.lastPos = newPos;
            
            if(lastVal !== stepped){ //only trigger event if value is new
		           simulateEvent('input', originalNode);
            }
          }	
        });
  
  			document.addEventListener("mouseup", function(e){
						focused = null;
          	document.body.className = document.body.className.replace("noSelection", "");
        });
  
  		  var w = parseInt(getCSS(face, "width"));
        
				w = w + progWidth;
    
        progress.setAttribute("height", w * 2);
        progress.setAttribute("width", w * 2);
        progress.style.width = w+"px";
        progress.style.height = w+"px";
        face.style.marginTop = (progWidth/2)+"px";
        face.style.marginLeft = (progWidth/2)+"px";
	
         drawArc(progress, rad * 2, degrees, parseInt(min), progWidth, progColor);
      } //end loop

}

function clearCanvas(canvas){
  var ctx = canvas.getContext("2d");
  ctx.clearRect ( 0 , 0 , canvas.width,   canvas.height );
}

function drawArc(canvas, radius, deg, min, lw, col){
  			//console.log(canvas, radius, deg, min, lw, col);
        var ctx = canvas.getContext("2d");
			  clearCanvas(canvas);
				ctx.beginPath();          
        ctx.arc(canvas.width / 2, canvas.height / 2,radius, toRad(90 + parseInt(min)), toRad(90+ deg), false); 
    		ctx.strokeStyle = col;
  			ctx.lineWidth = lw * 2;
				ctx.stroke();
}

function simulateEvent(ev, elm) {
  var event = new Event('input', {
    'view': window
  });
  var cb = elm; 
  cb.dispatchEvent(event);
}

function toRad(deg){
  var rad = deg / (180 / Math.PI);
  return rad;
}


function rotate(elm, deg){
    elm.style.transform = "rotate("+ deg +"deg)"; 
}

function getCSS(elm, prop){
  return window.getComputedStyle(elm, prop).getPropertyValue(prop);
}

rangeKnob(document.querySelectorAll('.blue'), 20, "#69abcd");