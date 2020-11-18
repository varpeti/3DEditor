const xz = document.getElementById("xz");
const yz = document.getElementById("yz");
const xy = document.getElementById("xy");
const coords = document.getElementById("coords");
const tools = document.getElementById("tools");

const oneMeterIs = 4;

const XX = 10*oneMeterIs;
const YY = 10*oneMeterIs; 
const ZZ = 10*oneMeterIs; 

const HX = (XX/2) -0.5;
const HZ = (YY/2) -0.5;

const convertToJMAVSim = (x,y,z) =>
{
    return ("z x y\n".replace("x",(x-HX)/oneMeterIs).replace("y",-(y+0.5)/oneMeterIs).replace("z",-(z-HZ)/oneMeterIs));
}

const xyz = [];
for (let x = 0; x < XX; x++) {
    xyz.push([]);
    for (let y = 0; y < YY; y++)
    {
        xyz[x].push([]);
        for (let z = 0; z < ZZ; z++)
        {
            xyz[x][y].push(0);
        }
    }
}

const addNewElem = (id) =>
{
    return (`<div class="elem off" id="{id}" onClick="handleClick('{id}');"></div>`.replaceAll("{id}",id));
}

const genGrid = (A,B,id) =>
{
    let ret = ""
    for (var b = 0; b < B; b++) 
    {
        for (var a = 0; a < A; a++) 
        {
            ret += addNewElem(id+" "+a+" "+b);
            if (a%4==3) ret += "&nbsp;&nbsp;&nbsp;&nbsp;";
            if (a%20==19) ret += "&nbsp;&nbsp;&nbsp;&nbsp;";
        }
        ret += "<br/>";
        if (b%4==3) ret += "<br/>";
        if (b%20==19) ret += "<br/>";
    }
    return ret;
}

const flipOn = (id,lvl) =>
{
    const elem = document.getElementById(id);

    if (elem.classList.contains('s0')) elem.classList.remove('s0');
    if (elem.classList.contains('s1')) elem.classList.remove('s1');
    elem.classList.add('s'+lvl);
}


const render = () =>
{
    xz.innerHTML = genGrid(XX, ZZ, "xz");
    yz.innerHTML = genGrid(YY, ZZ, "yz");
    xy.innerHTML = genGrid(XX, YY, "xy");

    let ret = "";

    for (let x = 0; x < XX; x++) for (let y = 0; y < YY; y++) for (let z = 0; z < ZZ; z++)
    {
        if (xyz[x][y][z]) 
        {
            if (xyz[x][y][z]===2) ret += convertToJMAVSim(x,y,z);
            flipOn("xz {x} {z}".replace("{x}",x).replace("{z}",z), xyz[x][y][z]);
            flipOn("yz {y} {z}".replace("{y}",y).replace("{z}",z), xyz[x][y][z]);
            flipOn("xy {x} {y}".replace("{x}",x).replace("{y}",y), xyz[x][y][z]);
        }
    }
    return ret;
}

let select3rd = "";
let grid = "";
let a = 0;
let b = 0;

const handleClick = (id) =>
{
    const reg = id.match(/(..) (\d*) (\d*)/);

    if (select3rd === "")
    {
        grid = reg[1];
        a = reg[2];
        b = reg[3];
        if      (grid === "xz") {for (let y = 0; y < YY; y++) xyz[a][y][b] += 1; select3rd="y";}
        else if (grid === "yz") {for (let x = 0; x < XX; x++) xyz[x][a][b] += 1; select3rd="x";}
        else if (grid === "xy") {for (let z = 0; z < ZZ; z++) xyz[a][b][z] += 1; select3rd="z";}
    }
    else
    {
        const newGrid = reg[1];
        if (newGrid.includes(select3rd)) 
        {
            
            if      (newGrid.substr(0,1).includes(select3rd)) c = reg[2];
            else if (newGrid.substr(1,1).includes(select3rd)) c = reg[3];

            if      (grid === "xz") {myTools[currentTool](a,c,b,"y");}
            else if (grid === "yz") {myTools[currentTool](c,a,b,"x");}
            else if (grid === "xy") {myTools[currentTool](a,b,c,"z");}
        }

        removeLines();

        select3rd="";
    }

    coords.innerText = render();
}

const removeLines = () =>
{
    for (let x = 0; x < XX; x++) for (let y = 0; y < YY; y++) for (let z = 0; z < ZZ; z++)
    {
        if (xyz[x][y][z] === 1 | xyz[x][y][z] === 3) xyz[x][y][z]-=1;
    }
}

render();

let currentTool = "";
const myTools = {};

const addTool = (name,fv) =>
{
    tools.innerHTML += `<p id="tool_{name}" onclick="setTool('{name}')">{name}</p>`.replaceAll("{name}",name);
    myTools[name] = fv;
}

const setTool = (name) =>
{
    const es = document.getElementsByClassName("selectedTool");
    if (es[0]) es[0].classList.remove("selectedTool");
    document.getElementById("tool_"+name).classList.add("selectedTool");
    currentTool = name;
}

addTool("box0.25",(x,y,z)=>{
    xyz[1*x][1*y][1*z] = (xyz[1*x][1*y][1*z]+2) % 4;
}); 
setTool("box0.25");

addTool("box0.5",(x,y,z)=>
{
    for (var ix = 0; ix < 2; ix++) for (var iy = 0; iy < 2; iy++) for (var iz = 0; iz < 2; iz++)
    {
        xyz[1*x+ix][1*y+iy][1*z+iz] = (xyz[1*x+ix][1*y+iy][1*z+iz]+2) % 4
    }
});

addTool("box1.0",(x,y,z)=>
{
    for (var ix = 0; ix < 4; ix++) for (var iy = 0; iy < 4; iy++) for (var iz = 0; iz < 4; iz++)
    {
        xyz[1*x+ix][1*y+iy][1*z+iz] = (xyz[1*x+ix][1*y+iy][1*z+iz]+2) % 4
    }
});

addTool("box2.0",(x,y,z)=>
{
    for (var ix = 0; ix < 8; ix++) for (var iy = 0; iy < 8; iy++) for (var iz = 0; iz < 8; iz++)
    {
        xyz[1*x+ix][1*y+iy][1*z+iz] = (xyz[1*x+ix][1*y+iy][1*z+iz]+2) % 4
    }
});

addTool("box4.0",(x,y,z)=>
{
    for (var ix = 0; ix < 16; ix++) for (var iy = 0; iy < 16; iy++) for (var iz = 0; iz < 16; iz++)
    {
        xyz[1*x+ix][1*y+iy][1*z+iz] = (xyz[1*x+ix][1*y+iy][1*z+iz]+2) % 4
    }
});

addTool("line",(x,y,z,c)=>
{
    let xi = x*1;
    let yi = y*1;
    let zi = z*1;
    let addOrRemove = xyz[xi][yi][zi]<2;
    try {
        while( (xyz[xi][yi][zi]<2)*1 === (addOrRemove)*1 )
        {
            xyz[xi][yi][zi]+=1;
            if      (c=="x") xi-=1;
            else if (c=="y") yi-=1;
            else if (c=="z") zi-=1;
        }
    }
    catch (e) {}; // overflow, witch means we r @ the border
});

addTool("recursive_remove",(x,y,z,c)=>
{
    const rr = (x,y,z) =>
    {
        try {
            if (xyz[x][y][z]>1) 
            {
                xyz[x][y][z]-=2;
                for (var i = -1; i <= 1; i++)
                {
                    rr(x+i,y,z);
                    rr(x,y+i,z);
                    rr(x,y,z+i);
                }
            }
        }
        catch (e) {};
    }

    rr(x*1,y*1,z*1);
});