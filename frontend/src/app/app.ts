import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'yt-root',
  template: `<router-outlet />`,
  imports: [RouterOutlet],
})
export class App {}
