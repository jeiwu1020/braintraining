import { PlaygroundId } from '../../data/playgroundCatalog';
import { AuctionState, AuctionAction, exhibitionScore } from '../../games/playground/auction/rules';
import { GardenState, GardenAction, scoreGarden, formatGardenDelta } from '../../games/playground/garden/rules';
import { LanternState, LanternAction, DISTRICTS } from '../../games/playground/lantern/rules';
import { LighthouseState, LighthouseAction, PORTS } from '../../games/playground/lighthouse/rules';
import { WorkshopState, WorkshopAction, STATION_NAMES } from '../../games/playground/workshop/rules';
const signed = (n: number) => n >= 0 ? `+${n}` : `${n}`;
export function tableScore(game: PlaygroundId, value: unknown): string {
  if (game === 'garden') { const s=value as GardenState; return (['A','B'] as const).map(t=>{const p=scoreGarden(s.boards[t],s.size);return `${t}隊 ${p.total}分（花圃${p.flowers}＋步道${p.paths}）`;}).join(' · '); }
  if (game === 'auction') { const s=value as AuctionState; return (['A','B'] as const).map(t=>{const p=exhibitionScore(s.collections[t]);return `${t}隊 ${p.total}分（展品${p.base}＋套組${p.bonus}），餘${s.budgets[t]}枚`;}).join(' · '); }
  if (game === 'lantern') { const s=value as LanternState; return `累計 A隊 ${s.totals.A}分 · B隊 ${s.totals.B}分`; }
  if (game === 'workshop') { const s=value as WorkshopState; return (['A','B'] as const).map(t=>`${t}隊 ${s.stock[t].score}分，木${s.stock[t].wood}／金${s.stock[t].metal}／成品${s.stock[t].goods}，等級${s.stock[t].level}`).join(' · '); }
  if (game === 'lighthouse') { const s=value as LighthouseState; return `船在${PORTS[s.at]}，船艙燃料${s.cargo[0]}／糧食${s.cargo[1]}；${s.needs.slice(1).map((n,i)=>`${PORTS[i+1]}尚需${n[0]}燃料、${n[1]}糧食`).join('；')}`; }
  return '';
}
export function tableAction(game: PlaygroundId, before: unknown, action: unknown, after: unknown): string {
  if (game === 'garden') {
    const s=before as GardenState, n=after as GardenState, a=action as GardenAction;
    const old=scoreGarden(s.boards[s.turn],s.size), next=scoreGarden(n.boards[s.turn],s.size);
    return `${a.type==='discard'?'無合法落點，略過':`地形${a.slot+1}，方向${a.rotation*90}°`}；${formatGardenDelta(old, next)}。`;
  }
  if (game === 'auction') { const s=before as AuctionState,a=action as AuctionAction; return a.type==='bid'?`對「${s.exhibits[s.lot].name}」叫價${s.price+1}枚。`:a.type==='pass'?`退出「${s.exhibits[s.lot].name}」。`:'確認成交結果，繼續展覽。'; }
  if (game === 'lantern') { const a=action as LanternAction; return a.type==='place'?`在${DISTRICTS[a.to]}放置${a.count}盞。`:a.type==='move'?`從${DISTRICTS[a.from]}移${a.count}盞至${DISTRICTS[a.to]}。`:a.type==='pass'?'保留布局，等待一手。':'確認本次評比，繼續。'; }
  if (game === 'lighthouse') { const a=action as LighthouseAction; return a.type==='load'?`裝入${a.fuel}燃料、${a.food}糧食。`:a.type==='sail'?`航向${PORTS[a.to]}。`:a.type==='unload'?'卸下當地所需貨物。':a.type==='rig'?'整備航行。':a.type==='wait'?'等待下一回合。':'開始下一回合。'; }
  if (game === 'workshop') { const a=action as WorkshopAction;return a.type==='use'?`派工匠到${STATION_NAMES[a.station]}${a.station==='craft'||a.station==='ship'?`，${a.count}件`:''}。`:a.type==='rest'?`派工匠休息${a.resource?`，取1${a.resource==='wood'?'木料':'金屬'}`:''}。`:'確認今日結果，繼續。'; }
  return '';
}
