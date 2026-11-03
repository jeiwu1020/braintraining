// @vitest-environment jsdom
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const render=(node:React.ReactNode)=>{const container=document.createElement('div');container.innerHTML=renderToStaticMarkup(node);return {container}};
import {describe,it,expect} from 'vitest';
import Art from '../components/playground/NewBoardgameArt';

describe('whole-panel aspect ratio',()=>{
 for(const [game,x,y] of [['beans',0,0],['lost',-887,0],['animals',0,-443.5],['borrow',-887,-443.5]] as const){
 it(`${game} preserves full 2:1 panel without stretching`,()=>{
 const {container}=render(<Art game={game}/>);const svg=container.querySelector('svg')!;const image=svg.querySelector('image')!;
 expect(svg.getAttribute('viewBox')).toBe('0 0 887 443.5');expect(svg.getAttribute('preserveAspectRatio')).toBe('xMidYMid meet');
 expect(image.getAttribute('x')).toBe(String(x));expect(image.getAttribute('y')).toBe(String(y));expect(image.getAttribute('width')).toBe('1774');expect(image.getAttribute('height')).toBe('887');
 expect(svg.querySelector('clipPath rect')?.getAttribute('width')).toBe('887');expect(svg.querySelector('clipPath rect')?.getAttribute('height')).toBe('443.5');
 });
 }
 it('does not change legacy game art',()=>{const {container}=render(<Art game="wall-race"/>);expect(container.firstChild).toBeNull()});
});
