import { Color } from 'pixel_combats/basic';
import { Teams,Ui,Spawns } from 'pixel_combats/room';
try{
  // команды
  Teams.Add('Player','<b>Синие</b>', new Color(0,0,1,0));
  Teams.Add('Player2','<b>Красные</b>', new Color(1,0,0,0));
  Player.Spawns.SpawnPointsGroups.Add(1);
  Player2.Spawns.SpawnPointsGroups.Add(2);
  // спавн по дефолту за синих
  Teams.OnRequestJoinTeam.Add(function (p, t) { Player.Add(p); });
  Teams.OnPlayerChangeTeam.Add(function (p) { p.Spawns.Spawn() });
  
}catch(e){
  Ui.GetContext().Hint.Value = 'eror';
}
