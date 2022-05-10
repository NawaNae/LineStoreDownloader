// ==UserScript==
// @name         Line Store Downloader
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       NawaNawa (繩繩#2404)
// @match        https://store.line.me/*shop/product/*
// @require https://myweb.ntut.edu.tw/~t105590029/js/jszip.min.js
// @require https://raw.githubusercontent.com/zenorocha/clipboard.js/master/dist/clipboard.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    function download(url,filename)
    {
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
    }
    function download_blob (blob,filename) {
        var url = window.URL.createObjectURL(blob);
        download(url,filename);
        window.URL.revokeObjectURL(url);
    }
    function copy(txt)
    {
        let ip=document.createElement('input');
        ip.value=txt;
        document.body.append(ip);
        ip.select();
        document.execCommand("copy");
        ip.remove();
    }
    async function copyImage(url) {
        console.log("Wriing to clipbard");

        const response = await fetch(url);
        const blob = await response.blob();

        const item = new ClipboardItem({'image/png': blob});
        await navigator.clipboard.write([item]).then(function() {
          console.log("Copied to clipboard successfully!");
        }, function(error) {
          console.error("unable to write to clipboard. Error:");
          console.log(error);
        });
    }
        var src=document.location.href;
        var storeStr=src.match(/\/([^\/]+?)shop\//)[1];
        let btnContainer=document.querySelector(storeStr=="sticker"?"[data-widget=PurchaseButtons]": storeStr=="emoji" ? ".mdCMN38Item01Ul" :".mdCMN08Ul");
        let downloadBtn=document.createElement("button");
        downloadBtn.innerText="Download Zip";
        const sitckerName=document.querySelector(storeStr=="sticker" || storeStr == "emoji"?".LyMain p:last-child":".mdCMN08Ttl").innerText;
        downloadBtn.classList.add("MdBtn01P01");
        let imgs=[];

        btnContainer.appendChild(document.createElement("li").appendChild(downloadBtn));
        downloadBtn.addEventListener("click",async ()=>
        {
            var zip=new JSZip();
            for(let img of imgs)
            {
                let rp=await fetch(img.url);
                zip.file(`${img.name}.png`,rp.blob());
            }
            let blob=await zip.generateAsync({type: "blob"});
            download_blob(blob,`${sitckerName}.zip`);
        });

        let imgsE=document.querySelectorAll(storeStr=="sticker"||storeStr=="emoji"?"[data-widget-id=StickerPreview] [data-preview]":".mdCMN09Image.FnImage");
        for(let i in imgsE)
        {
            if(i=="length")break;
            let img=imgsE[i];
            let config=storeStr=="sticker"||storeStr=="emoji"?JSON.parse(img.dataset["preview"]):{staticUrl:img.style.backgroundImage.match(/"(https.+?)"/)[1],};
            config.url=config.animationUrl?config.animationUrl:config.staticUrl;
            config.url=config.url.replace(/;compress=true/g,"");
            imgs.push({name:`${sitckerName}_${i}`,url:config.url});
            img.addEventListener("click",async function()
            {
                console.log("click");
                copyImage(config.url);
                //copy(config.url);
            });
        }
})();