const log = console.log;

const canvas = document.getElementById('canvas');

canvas.addEventListener('mousedown',  (e) => {if (e.button===0) add(0,getCoords(getCursorPosition(canvas,e)));});
canvas.addEventListener('mouseup',    (e) => {if (e.button===0) add(1,getCoords(getCursorPosition(canvas,e)));});
canvas.addEventListener('contextmenu',(e) => {select(getCoords(getCursorPosition(canvas,e)));e.preventDefault();});
window.addEventListener('keydown',    (e) => {doKeyDown(e);});

const cursorPos = {x:0,y:0}
canvas.addEventListener('mousemove',(e) => {cursorPos.x=e.clientX;cursorPos.y=event.clientY});

canvas.width  = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;

const c = canvas.getContext("2d");
c.lineWidth = "1";

const cX = canvas.width;
const cY = canvas.height;
const hcX = Math.floor(cX/2);
const hcY = Math.floor(cY/2);
    
const XZ = {left:    0,bottom:hcY,right: hcX,top:    0};
const YZ = {left:hcX+1,bottom:hcY,right:  cX,top:    0};
const XY = {left:    0,bottom: cY,right: hcX,top:hcY+1};


const getCursorPosition = (canvas, event) =>
{
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return {x:x,y:y}
}

const isInsideRectangle = (pos,rec) =>
{
    let [l,r] = rec.left<rec.right?[rec.left,rec.right]:[rec.right,rec.left];
    let [t,b] = rec.top<rec.bottom?[rec.top,rec.bottom]:[rec.bottom,rec.top];
    return l<pos.x && r>pos.x && t<pos.y && b>pos.y;
}

const getCoords = (pos) =>
{   
    if (isInsideRectangle(pos,XZ)) return {x:pos.x,     z:pos.y,     y:null, ad:"xz", ae:"y", a: pos.x, b: pos.y};
    if (isInsideRectangle(pos,YZ)) return {y:pos.x-hcX, z:pos.y,     x:null, ad:"yz", ae:"x", a: pos.x, b: pos.y};
    if (isInsideRectangle(pos,XY)) return {x:pos.x,     y:pos.y-hcY, z:null, ad:"xy", ae:"z", a: pos.x, b: pos.y};
    return null;
}


const rCC = () =>
{
    const pad = (n) => n.length<2?"0"+n:n;

    let n = Math.floor(Math.random()*(3*255));
    if (n<=255)                 return "#"+pad((255-(n-0*255)).toString(16))+pad((n-0*255).toString(16))+"00"; 
    else if (n>255 && n<=2*255) return "#"+"00"+pad((255-(n-1*255)).toString(16))+pad((n-1*255).toString(16));
    else if (n>2*255)           return "#"+pad((n-2*255).toString(16))+"00"+pad((255-(n-2*255)).toString(16));
}

const boxes = [];
let add_box = {top:{x:null,y:null,z:null},bottom:{x:null,y:null,z:null},color:rCC()};
let msDown = false;
let add_status = 0;
let add_rect = {left:null,bottom:null,right:null,top:null};
let add_line = {left:null,bottom:null,right:null,top:null};
let add_ad   = null;
let add_ae   = null;


const resetAdd = () =>
{
    add_box = {top:{x:null,y:null,z:null},bottom:{x:null,y:null,z:null},color:rCC()};
    add_status=0;
}

const add = (md,coords) =>
{

    if (coords == null) {resetAdd();return;}

    let ac = "";
    if (md) {ac="bottom"; bc="right"; msDown=false;} else {ac="top"; bc="left"; msDown=true;};

    if (coords.x && add_box[ac].x==null) add_box[ac].x = coords.x;
    if (coords.y && add_box[ac].y==null) add_box[ac].y = coords.y;
    if (coords.z && add_box[ac].z==null) add_box[ac].z = coords.z;

    if      (add_status === 0 && !md) 
    {
        add_rect.left   = coords.a;
        add_rect.top    = coords.b;
        add_ad          = coords.ad;
    } 
    else if (add_status === 1 &&  md && coords.ad === add_ad && area({...add_rect,right:coords.a,bottom:coords.b})>1 )
    {
        add_rect.right  = coords.a;
        add_rect.bottom = coords.b; 
    }
    else if (add_status === 2 && !md && coords.ad !== add_ad)
    {
        add_line.left   = coords.a;
        add_line.top    = coords.b;
        add_ae          = coords.ae;
    } 
    else if (add_status === 3 &&  md && coords.ae === add_ae && area({...add_line,right:coords.a,bottom:coords.b})>1)
    {
        add_line.right  = coords.a;
        add_line.bottom = coords.b; 
    }
    else {resetAdd();return;}

    add_status++;


    if (add_box.top.x   !=null && add_box.top.y   !=null && add_box.top.z   !=null &&
        add_box.bottom.x!=null && add_box.bottom.y!=null && add_box.bottom.z!=null  )
    {
        log(add_box);
        boxes.push(add_box);
        resetAdd();
        print();
    }

}

let selected = [];

const select = (coords) =>
{
    if (selected.length===0) selected = [...boxes];
    for (let i = 0; i<selected.length;i++)
    {
        //log(0,selected);
        let box = selected[i];
        
        if (coords.ad === "xz" && 
            !isInsideRectangle({x:coords.a,y:coords.b},{left:box.top.x,top:box.top.z,right:box.bottom.x,bottom:box.bottom.z}))        
        {
            selected.splice(i,1);
            //log("r xz",box);
            i--;
        }
        if (coords.ad === "yz" && 
            !isInsideRectangle({x:coords.a,y:coords.b},{left:box.top.y+hcX,top:box.top.z,right:box.bottom.y+hcX,bottom:box.bottom.z}))
        {
            selected.splice(i,1);
            //log("r yx",box);
            i--;
        }
        if (coords.ad === "xy" && 
            !isInsideRectangle({x:coords.a,y:coords.b},{left:box.top.x,top:box.top.y+hcY,right:box.bottom.x,bottom:box.bottom.y+hcY}))   
        {
            selected.splice(i,1);
            //log("r yx",box);
            i--;
        }
    }
    //log(1,selected);
    selected = [...selected];
}

const doKeyDown = (e) =>
{
    //log(e.key);
    switch (e.key)
    {
        case "d": //delete
        case "Delete": 
            while (selected.length>0)
            {
                boxes.splice(boxes.indexOf(selected[selected.length-1]),1);
                selected.pop();
            }
            selected = [];
        break;
        case "c": //change color
            for(i in selected) selected[i].color = rCC();
        break;
        case "m": //move
            log("TODO");
        break;
    }
}

const area = (rec) =>
{
    return Math.abs(rec.left-rec.right)*Math.abs(rec.bottom-rec.top);
}

const getSize = (box) =>
{
    return {
        x:Math.abs((box.top.x-box.bottom.x)/e_oneMeterIs.value).toFixed(3),
        y:Math.abs((box.top.y-box.bottom.y)/e_oneMeterIs.value).toFixed(3),
        z:Math.abs((box.top.z-box.bottom.z)/e_oneMeterIs.value).toFixed(3)
    }
}

const drawLine = (line) =>
{
    if (line.left==null || line.bottom==null || line.right==null || line.top==null) return;
    c.beginPath()
    c.moveTo(line.left, line.top);
    c.lineTo(line.right, line.bottom);
    c.stroke();
    c.closePath() 
}

const drawRect = (rec,fill) =>
{
    if (rec.left==null || rec.bottom==null || rec.right==null || rec.top==null) return;

    if (fill)
        c.fillRect(
            rec.left,
            rec.top,
            rec.right-rec.left,
            rec.bottom-rec.top,
        );
    else
        c.strokeRect(
            rec.left,
            rec.top,
            rec.right-rec.left,
            rec.bottom-rec.top,
        );
}

const drawBox = (box,fill) =>
{   
    c.strokeStyle = box.color;
    c.fillStyle   = box.color+"40";
    
    //XZ
    drawRect({left:box.top.x,top:box.top.z,right:box.bottom.x,bottom:box.bottom.z},fill);
    //YZ
    drawRect({left:box.top.y+hcX,top:box.top.z,right:box.bottom.y+hcX,bottom:box.bottom.z},fill);
    //XY
    drawRect({left:box.top.x,top:box.top.y+hcY,right:box.bottom.x,bottom:box.bottom.y+hcY},fill);

    c.strokeStyle = 'white';
    c.fillStyle   = 'black';
}


const origoSize = 5;

const render = () =>
{
    let coords = getCoords(cursorPos);
    if (!coords) return;

    c.clearRect(0,0,cX,cY);
    c.fillStyle='black'; c.strokeStyle='white';
    c.fillRect(0,0,cX,cY);

    //planes
    drawRect(XZ); drawRect(YZ); drawRect(XY);

    //origo
    drawLine({left:e_HX.value*1-origoSize,top:e_HZ.value*1-origoSize,right:e_HX.value*1+origoSize,bottom:e_HZ.value*1+origoSize});
    drawLine({left:e_HX.value*1+origoSize,top:e_HZ.value*1-origoSize,right:e_HX.value*1-origoSize,bottom:e_HZ.value*1+origoSize});

    //add
    if      (add_status === 1)
    {
        drawRect({left:add_rect.left,top:add_rect.top,right:coords.a,bottom:coords.b});
        drawLine({left:add_rect.left,top:add_rect.top,right:coords.a,bottom:coords.b});
    }
    else if (add_status === 2)
    {
        drawRect(add_rect);
        drawLine(add_rect);
    }
    else if (add_status === 3)
    {
        drawRect(add_rect);
        drawLine(add_rect);

        //log(add_ad);
        if      (add_ad === "yz")
        {
            if      (add_ae === "y")
                drawRect({left:add_line.left,top:add_rect.top,right:coords.a,bottom:add_rect.bottom});
            else if (add_ae === "z") 
                drawRect({left:add_line.left,top:add_rect.top+hcY,right:coords.a,bottom:add_rect.bottom+hcY});
        }
        else if (add_ad === "xy")
        {
            if      (add_ae === "x")
                drawRect({left:add_rect.left+hcX,top:add_line.top,right:add_rect.right+hcX,bottom:coords.b});
            else if (add_ae === "y") 
                drawRect({left:add_rect.left,top:add_line.top,right:add_rect.right,bottom:coords.b});
        }
        else if (add_ad == "xz")
        {
            if      (add_ae === "x")
                drawRect({left:add_line.left,top:add_rect.top,right:coords.a,bottom:add_rect.bottom});
            else if (add_ae === "z") 
                drawRect({left:add_rect.left,top:add_line.top,right:add_rect.right,bottom:coords.b});
        }

           
        //drawRect({left:add_line.left,top:add_line.top,right:coords.a,bottom:coords.b});
        drawLine({left:add_line.left,top:add_line.top,right:coords.a,bottom:coords.b});
    }

    //select
    for (i in selected)
    {
        drawBox(selected[i],true);
    }

    //boxes

    for (i in boxes)
    {
        drawBox(boxes[i]);
    }


    //debug

    c.strokeText("pos: "+cursorPos.x+" "+cursorPos.y,hcX+10,hcY+20);
    c.strokeText("coords: "+coords.x+" "+coords.y+" "+coords.z,hcX+10,hcY+40);
    c.strokeText("add_status: "+add_status,hcX+10,hcY+60);
    c.strokeText("selected: "+selected.length,hcX+10,hcY+80);
    if (boxes.length>0)
    {
        const lobjs = getSize(boxes[boxes.length-1]);
        c.strokeText("last object size: "+lobjs.x+" "+lobjs.y+" "+lobjs.z,hcX+10,hcY+100);
    }
    if (selected.length===1)
    {
        const sobjs = getSize(selected[0]);
        c.strokeText("last object size: "+sobjs.x+" "+sobjs.y+" "+sobjs.z,hcX+10,hcY+100);
    }

}

setInterval(render,66); //15fps 

const e_textarea = document.getElementById("textarea");
const e_oneMeterIs = document.getElementById("oneMeterIs"); e_oneMeterIs.value = Math.floor((hcX+hcY)/(20*2));
const e_HX = document.getElementById("HX"); e_HX.value = Math.floor(hcX/2);
const e_HZ = document.getElementById("HY"); e_HZ.value = Math.floor(hcY/2);
const print = () =>
{
    let oneMeterIs = e_oneMeterIs.value;
    let HX = e_HX.value*1;
    let HZ = e_HZ.value*1;

    let str = "";
    for (i in boxes)
    {
        let pos1 = 
        {
            x: (boxes[i].top.x   -HX) /oneMeterIs,
            y:-(boxes[i].top.y   +0.5)/oneMeterIs,
            z:-(boxes[i].top.z   -HZ) /oneMeterIs
        }
        let pos2 = 
        {
            x: (boxes[i].bottom.x-HX) /oneMeterIs,
            y:-(boxes[i].bottom.y+0.5)/oneMeterIs,
            z:-(boxes[i].bottom.z-HZ) /oneMeterIs
        }
        str += "z1 x1 y1 z2 x2 y2\n"
                .replace("x1",((pos1.x+pos2.x)/2).toFixed(3) )
                .replace("y1",((pos1.y+pos2.y)/2).toFixed(3) )
                .replace("z1",((pos1.z+pos2.z)/2).toFixed(3) )
                .replace("x2",(Math.abs(pos1.x-pos2.x)/2).toFixed(3) )
                .replace("y2",(Math.abs(pos1.y-pos2.y)/2).toFixed(3) ) 
                .replace("z2",(Math.abs(pos1.z-pos2.z)/2).toFixed(3) );
    }
    e_textarea.value = str;
}