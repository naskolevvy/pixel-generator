	var canvasArray = document.getElementById('canvasArray');  //global elements definition
	var canvas = document.getElementById('myCanvas');
	var tempCanvas=document.createElement("canvas"); //test to resize image
	var log = document.getElementById('log');
	var tool = document.getElementById('tooltipNew'); 
	var fileInput = document.getElementById("fileinput");
	var projectInput = document.getElementById('projectInput');
	var ctxAr = canvasArray.getContext('2d'); //getting canvas context
	var ctx = canvas.getContext('2d');
	var tctx=tempCanvas.getContext("2d");
	
	canvasArray.style.display = "none"; //hiding unwanted elements
	log.style.display = "none";
	
	var pixArray = []; //defining global variables
	var newR = -1;
	var newG = -1;
	var newB = -1;
	var command = -1;
	var imageName;
	
	var jsonArray;
	function pixelate(){
		
		// files is a FileList object (similar to NodeList)
		var files = fileInput.files;
		var file;

		// loop through files
		if(files.length > 0){
			file = files[0];
		}
		let reader = new FileReader();
				reader.readAsDataURL(file);
				reader.onloadend = function(e){
					var image = new Image();
					image.src = e.target.result;
					image.onload = function(ev){
						
										
						var checkbox = document.getElementById('natural'); //autopixelate checkbox
						var horizontalChange;
						var verticalChange;
				
						if(checkbox.checked == true){ //defining the variables for size
							var w = parseInt(image.width*2/10);
							var h = parseInt(image.height*2/10);
							horizontalChange = parseInt(image.width*2/w);
							verticalChange = parseInt(image.height*2/h);
							
						}else{
							var w = document.getElementById('width').value;
							var h = document.getElementById('height').value;
							horizontalChange = parseInt(image.width*2/w);
							verticalChange = parseInt(image.height*2/h);
						}
						
						var pixS = Math.min(horizontalChange,verticalChange);  //pixel side is gonna be that big
						imageName = pixS + "_";
						
						//drawing the image preview	
						canvas.style.display = "block";
						canvas.width = pixS*w;
						canvas.height = pixS*h;				
						ctx.drawImage(image,0,0,canvas.width,canvas.height);
					
						var sample = ctx.getImageData(0,0,parseInt(image.width*2/w)*w,parseInt(image.height*2/h)*h).data; //getting the image data
						
						//displaying the pixelated image
						
						drawPixels(parseInt(image.width*2/w)*w,sample,pixS,w,h);	//draw the image using drawpixels()														
					}
				}		
	}
	
		
	document.addEventListener('mousedown',hideOrShow,false);
	canvasArray.addEventListener('mousedown',lastCommand ,false);	
	canvasArray.addEventListener('mousemove',showTooltip,false); //show the tooltip event
	canvasArray.addEventListener('mouseout',hideTooltip,false); //hide the tooltip event
	canvasArray.addEventListener('contextmenu',contextMenu,false); //show the context menu event
	
	function drawPixels(width,sample,pixS,w,h){ //function to draw the pixels 
		canvasArray.style.display = "block";
		log.style.display = "flex";
		canvasArray.width = pixS*w+1; //add one to finish the drawing of the border on the sides
		canvasArray.height = pixS*h+1;
		log.innerHTML = ""; //clearing the log if not empty
		pixArray = []; //reseting pixArray
		jsonArray = [];
		var imageInfo = {width: width,log: 0,side: pixS,numW: w,numH: h};
		pixArray.push(imageInfo);
		var pixel; //pixel variable
		var countY = 0; //counts the rows
		var countX = 0; //counts the columns
		
		for (var y= 0; y < pixS*h; y+= pixS) {  // loop through all the columns 
			countX = 0;
			countY++;
		  for (var x = 0; x < pixS*w; x+= pixS) { //loop trough all the row elements
			
			var pos = (x + y * width) * 4;
			var red   = sample[pos];
			var green = sample[pos + 1];
			var blue  = sample[pos + 2]; 
			countX++;
			var color = rgbToHex(red,green,blue); //converting to hex to compress the project file
			pixel = {verticalPos: countY,horizontalPos: countX, originalColorHex: color, newColorHex: color, X: x, Y: y}; //create pixel variable
			pixArray.push(pixel); //add the pixels to the pixel array
			paintPixel(x,y,pixS,color);
		  }
		}	
		
		
	}
	
	var converter = function (rgb) { 
	  var hex = Number(rgb).toString(16);
	  if (hex.length < 2) {
		   hex = "0" + hex;
	  }
	  return hex;
	};
	var rgbToHex = function(r,g,b) {   
	  var red = converter(r);
	  var green = converter(g);
	  var blue = converter(b);
	  return "#"+red+green+blue;
	};
	function hexToRgb(hex) {
	  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	  return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	  } : null;
	}
	
	function paintPixel(x,y,side,color){ //function to paint the pixel
		ctxAr.fillStyle = color; //set color
		ctxAr.fillRect(x, y, side, side); //paint the box
		ctxAr.strokeRect(x + 0.5,y+ 0.5,side,side); //drawing the grid around each pixel, +0.5 is to draw at the side of the pixel
	}
	
	function saveImage(){ //save pixelated image in original size NEED TO REMOVE THE GRID FROM THE IMAGE BEFORE SAVING ; 
		//ALSO ANOTHER BUG WITH SAVING IMAGE FROM SAVED IMAGE
		var name = prompt("Enter image name without extensions(.jpg,.png, etc): ") + ".jpg"; //make the image name into correct format
		imageName += name ;
		var element = document.createElement('a');
		element.setAttribute('href', document.getElementById('canvasArray').toDataURL('image/jpg'));
		element.setAttribute('download', imageName);
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	}
	
	function saveProject(){ //save the information about pixArray as json file that can be loaded
		var projectName = prompt("Enter the name of the project: ") + ".project"; //make the image name into correct format
		pixArray[0].log = log.innerHTML;
		jsonArray = JSON.stringify(pixArray,null,2);
		var a = document.createElement("a");
		var file = new Blob([jsonArray], {type: 'text/plain'});
		a.href = URL.createObjectURL(file);
		a.download = projectName;
		a.click();
	}
	
	projectInput.addEventListener('change',function(event){ //when the user uploads a project file this function kicks 
		var files = projectInput.files;
		var file;
		if(files.length > 0){
			for(i=0;i<files.length;i++){
				var name = files[i].name;
				if(name.includes('.project')){
					
					file = files[i];
					break;
				}
			}
		}
		let reader = new FileReader();
		reader.readAsText(file);
		reader.onloadend = function(e){
			var object = JSON.parse(e.target.result);
			console.dir(object);
			pixArray = object; //making pixArray equal the object
			canvasArray.style.display = "block";
			log.style.display = "flex";
			canvasArray.width = object[0].side*object[0].numW+1; //add 1 to finish drawing the border on the right and on the bottom
			canvasArray.height = object[0].side*object[0].numH+1;
			canvas.style.display = 'none';
			log.innerHTML = object[0].log; //recovering the log
			for(i = 1;i<object.length;i++){
				paintPixel(object[i].X,object[i].Y,object[0].side,object[i].newColorHex);
			}
		}
	},false);
	
	function loadProject(){ //function to display the pixelated image from the json file
		document.getElementById('projectInput').click(); //trigers the hidden input file element
	}
	
	function hideOrShow(){ //function to hide/show context menu
		ev = event || window.event;
		if(ev.which == 1){ //left mouse click
			var el = document.getElementById('ctxMenu');
			var rect = el.getBoundingClientRect();
			if(ev.clientX > rect.left && ev.clientX < (rect.left+100) && ev.clientY > rect.top && ev.clientY < (rect.top+100)){
				
			}else{
				document.getElementById("ctxMenu").className = "hidden";	
			}
		}
	}
						
	function lastCommand(){ //function that repeats the last command used on left mouse click
		ev = event || window.event;
		if(ev.which == 1){
				switch(command){
					case 1:
						copyColor(1);
						break;
					case 2:
						pasteColor(1); //passing 1 or 0 to determine the way the pixel is found
						break;
					case 3:
						setColor(1);
						break;
					case 4:
						undoChanges(1);
						
				}
			}
	}
	
	function contextMenu(){ //function to display the context menu on right mouseclick
		ev = event || window.event;
		ev.preventDefault();	
		var pos = getPosition(canvasArray);
		var rect = canvasArray.getBoundingClientRect();
		document.getElementById("ctxMenu").className = "shown";
		document.getElementById("ctxMenu").style.top = (pos.y +window.scrollY+ ev.layerY)+ 'px';
		document.getElementById("ctxMenu").style.left = (pos.x +window.scrollX+ ev.layerX)+ 'px';
	}
	function hideTooltip(){ //function to hide the tooltip
		tool.style.display = "none";
	}
	function getPosition(el) { //function to get position of an element TAKEN FROM STACKOVERFLOW
	  var xPosition = 0;
	  var yPosition = 0;
	 
	  while (el) {
		if (el.tagName == "BODY") {
		  // deal with browser quirks with body/window/document and page scroll
		  var xScrollPos = el.scrollLeft || document.documentElement.scrollLeft;
		  var yScrollPos = el.scrollTop || document.documentElement.scrollTop;
	 
		  xPosition += (el.offsetLeft - xScrollPos + el.clientLeft);
		  yPosition += (el.offsetTop - yScrollPos + el.clientTop);
		} else {
		  xPosition += (el.offsetLeft - el.scrollLeft + el.clientLeft);
		  yPosition += (el.offsetTop - el.scrollTop + el.clientTop);
		}
	 
		el = el.offsetParent;
	  }
	  return {
		x: xPosition,
		y: yPosition
	  };
	}
	
	function showTooltip(){ //function to show the tooltip
		ev = event || window.event;
		//get exact coordinates of mouse
		var rect = canvasArray.getBoundingClientRect();
		var x = ev.clientX - rect.left;
		var y = ev.clientY - rect.top;
		tool.style.display = "block";
		
		for(i = 1; i< pixArray.length; i++){ //paint the tooltip and display info for pixel
			if(x>pixArray[i].X && x<(pixArray[i].X+pixArray[0].side)&&y>pixArray[i].Y&&y<(pixArray[i].Y+pixArray[0].side)){
				tool.style.background = pixArray[i].newColorHex;
				var newColor = hexToRgb(pixArray[i].newColorHex);									 
				tool.innerHTML = "<p> rgb(" + 
				newColor.r + ',' + newColor.g + ',' +
				newColor.b + ')' + "<p><p> Horizontal Number: "+pixArray[i].horizontalPos +
				"</p><p> Vertical Number: "+ pixArray[i].verticalPos +"</p>";
				
				break;
			}
		}
		//move the tooltip to the desired location	
		tool.style.top = y-(151)+'px';
		tool.style.left = x+1+'px';							
	}		
	
	function findPixel(){ //function to find the pixel with mouse coordinates or the coordinates of the tool
		ev = event || window.event
		var pixelNumber;
		if(arguments[0] == 1){ //this variable determines if the function is called from left mouseclick or from ctxmenu
			var x = ev.layerX;
			var y = ev.layerY;
			if (x%pixArray[0].side == 0 || y%pixArray[0].side == 0){ //check if copycolor is applied to grid
				pixelNumber = -1;
				console.log("grid");
			}else{ //index number in pixels array
				for(i = 1; i < pixArray.length; i++){
					if(x>pixArray[i].X && x<(pixArray[i].X+pixArray[0].side)&&y>pixArray[i].Y&&y<(pixArray[i].Y+pixArray[0].side)){
						pixelNumber = i;
						break;
					}
				}
			}
		}else{  //coordinates of the tool
		
			var canvas = document.getElementById('canvasArray');
			var rect = canvas.getBoundingClientRect();
			var ctxMenu = document.getElementById('ctxMenu');
			var ctxrect = ctxMenu.getBoundingClientRect();
			var pixX = ctxrect.left-rect.left;
			var pixY = ctxrect.top-rect.top;
			if (pixY%pixArray[0].side == 0 || pixX%pixArray[0].side == 0){ //check if copycolor is applied to grid
				pixelNumber = -1;
			}else{ //save the pixel index of the selected pixel from the pixel array
				for(i = 1; i < pixArray.length; i++){
					if(pixX>pixArray[i].X && pixX<(pixArray[i].X+pixArray[0].side)&&pixY>pixArray[i].Y&&pixY<(pixArray[i].Y+pixArray[0].side)){
						pixelNumber = i;
						break;
					}
				}
			}
			
		}
		return pixelNumber;
	}
	function copyColor(){ //function to copy the color in a clipboard
	
		command = 1; //last used command
		var pixelNumber = findPixel(arguments[0]); //args determines which method to use in findpixel()
		if(pixelNumber != -1){
			var coppiedColor = hexToRgb(pixArray[pixelNumber].newColorHex);
			var str = "rgb("+coppiedColor.r+","+coppiedColor.g+","+coppiedColor.b+")";
			
			newR = coppiedColor.r; //setting the global variables for the new colors used in pastecolor()
			newG = coppiedColor.g;
			newB = coppiedColor.b;
			log.innerHTML += "Command: Coppy Color, from pixel("+pixArray[pixelNumber].horizontalPos+","+pixArray[pixelNumber].verticalPos+"), coppied color is: "+str+";<br>";
			log.scrollTop = log.scrollHeight;
		}else{
			window.alert("Can not copy color of the Grid!");
		}
		document.getElementById("ctxMenu").className = "hidden";
	}
	
	function pasteColor(){ //function that pastes the color on a pixel
		command = 2;   //last used command
		var pixelNumber = findPixel(arguments[0]);
		if(pixelNumber != -1){
			if(newR == -1 ){
			window.alert("No color to Paste!");
			}else{
				var oldC = hexToRgb(pixArray[pixelNumber].newColorHex);
				var newColorHex = rgbToHex(newR,newG,newB);
				pixArray[pixelNumber].newColorHex = newColorHex;
				var str = "rgb("+newR+","+newG+","+newB+")";
				var oldstr = "rgb("+oldC.r+","+oldC.g+","+oldC.b+")";
				paintPixel(pixArray[pixelNumber].X,pixArray[pixelNumber].Y,pixArray[0].side,pixArray[pixelNumber].newColorHex);
				log.innerHTML += "Command: Paste Color, on pixel("+pixArray[pixelNumber].horizontalPos+","+pixArray[pixelNumber].verticalPos+"), from: "+oldstr+" to: "+str+";<br>";
				log.scrollTop = log.scrollHeight;  //move the scroll up automatically
			}
			
		}else{
			//window.alert("Can not paste color on grid!");
		}
		document.getElementById("ctxMenu").className = "hidden";
	}
	
	function setColor(){
		command = 3;//last used command
		var r,g,b;
		var pixelNumber = findPixel(arguments[0]);
		if(pixelNumber != -1){
			r = prompt("Enter value for R(0-255):");
			g = prompt("Enter value for G(0-255):");
			b = prompt("Enter value for B(0-255):");
			var oldColor = hexToRgb(pixArray[pixelNumber].newColorHex);
			var newColor = rgbToHex(r,g,b);
			var oldCstring = "rgb("+oldColor.r+","+oldColor.g+","+oldColor.b+")";
			var newCstring = "rgb("+r+","+g+","+b+")";
			pixArray[pixelNumber].newColorHex = newColor;
			console.log(newColor);
			paintPixel(pixArray[pixelNumber].X,pixArray[pixelNumber].Y,pixArray[0].side,pixArray[pixelNumber].newColorHex);
			log.innerHTML += "Command: Set Color, on pixel("+pixArray[pixelNumber].horizontalPos+","+pixArray[pixelNumber].verticalPos+"), from: "+oldCstring+" to: "+newCstring +";<br>";
			log.scrollTop = log.scrollHeight;
		}else{
			window.alert("Can not set color of grid!");
		}
		document.getElementById("ctxMenu").className = "hidden";
	}
	
	function undoChanges(){ //function that changes the color of a pixel to original colors
		command = 4;//last used command
		var pixelNumber = findPixel(arguments[0]);	
		if(pixelNumber != -1){	
			var newColor = hexToRgb(pixArray[pixelNumber].originalColorHex);	
			var oldColor = hexToRgb(pixArray[pixelNumber].newColorHex);
			var nString = "rgb("+newColor.r+","+newColor.g+","+newColor.b+")";
			var oString = "rgb("+oldColor.r+","+oldColor.g+","+oldColor.b+")";
			paintPixel(pixArray[pixelNumber].X,pixArray[pixelNumber].Y,pixArray[0].side,pixArray[pixelNumber].originalColorHex);
			if(pixArray[pixelNumber].originalColorHex != pixArray[pixelNumber].newColorHex ){
				log.innerHTML += "Command: Undo Changes, on pixel("+pixArray[pixelNumber].horizontalPos+","+pixArray[pixelNumber].verticalPos+"), from: "+oString+"to: "+nString +";<br>";
				log.scrollTop = log.scrollHeight;
			}
			pixArray[pixelNumber].newColorHex = pixArray[pixelNumber].originalColorHex;
		}else{
			//cant click on grid
		}
		document.getElementById("ctxMenu").className = "hidden";
	}
	