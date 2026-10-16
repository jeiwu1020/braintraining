import {createServer} from 'vite';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import fs from 'node:fs';
const root=process.cwd(),server=await createServer({root,optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true},appType:'custom'});fs.mkdirSync(`${root}/assets/playground`,{recursive:true});
for(const [game,file,component] of [['lighthouse','Lighthouse','SeaChart'],['garden','Garden','GardenArt'],['lantern','Lantern','LanternArt'],['workshop','Workshop','WorkshopArt']]){const mod=await server.ssrLoadModule(`/components/playground/${file}.tsx`);let svg=renderToStaticMarkup(React.createElement(mod[component]));svg=svg.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ');fs.writeFileSync(`${root}/assets/playground/${game}.svg`,svg);}
const mod=await server.ssrLoadModule('/components/playground/Auction.tsx');let content='';for(const [i,kind] of ['ceramic','bronze','scroll'].entries()){const svg=renderToStaticMarkup(React.createElement(mod.ArtifactArt,{kind})).replace('<svg ','<svg width="260" height="210" ');content+=`<g transform="translate(${i*260} 0)">${svg}</g>`;}fs.writeFileSync(`${root}/assets/playground/auction.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 210">${content}</svg>`);await server.close();console.log('Five standalone vector box illustrations exported');
