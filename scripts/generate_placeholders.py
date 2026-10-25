"""Create original vector placeholder imagery. Replace images under public/images with product photos later."""
from pathlib import Path
from xml.sax.saxutils import escape
ROOT = Path(__file__).resolve().parents[1] / 'public' / 'images'
ROOT.mkdir(parents=True, exist_ok=True)
COLORS = {
 'beige': ('#b6ad9e','#ded7ca','#8c8375','#ded8cf'),
 'grey': ('#777977','#b4b7b5','#565956','#dedfdd'),
 'navy': ('#263c52','#55708a','#152b42','#d8dddf'),
 'brown': ('#76604e','#a18c78','#554034','#e1d9d1'),
 'black': ('#292b2e','#5c5c61','#111216','#d5d6d7'),
 'cream': ('#d8d2c6','#f2eee7','#bdb5a8','#e3dfd8'),
 'olive': ('#61665a','#949a8c','#454c42','#d2d5d0'),
 'blue': ('#52768a','#8facb9','#385e71','#d9e2e3')
}

def wrap(content, bg='#e8e6e1', kind='suit'):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1125" viewBox="0 0 900 1125" role="img" aria-label="Original Aura BOED {kind} illustration placeholder">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="{bg}"/><stop offset=".54" stop-color="#efeeec"/><stop offset="1" stop-color="#d5d5d3"/></linearGradient>
      <linearGradient id="suit" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--light,#bdb9b2)"/><stop offset=".47" stop-color="var(--mid,#999)"/><stop offset="1" stop-color="var(--dark,#666)"/></linearGradient>
      <linearGradient id="trouser" x1="0" y1="0" x2="1" y2="0"><stop stop-color="var(--dark,#777)"/><stop offset=".45" stop-color="var(--mid,#999)"/><stop offset="1" stop-color="var(--dark,#777)"/></linearGradient>
      <radialGradient id="glow"><stop stop-color="#fff" stop-opacity=".64"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <filter id="shadow"><feGaussianBlur stdDeviation="25"/></filter>
      <pattern id="grain" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 3h1M4 7h1" stroke="#333" stroke-opacity=".06"/></pattern>
    </defs>
    <rect width="900" height="1125" fill="url(#bg)"/><ellipse cx="350" cy="390" rx="570" ry="540" fill="url(#glow)"/>
    <ellipse cx="483" cy="1095" rx="205" ry="32" fill="#555" opacity=".16" filter="url(#shadow)"/>
    {content}
    <rect width="900" height="1125" fill="url(#grain)" opacity=".5"/>
    </svg>'''

def suit(color, offset=0):
    mid,light,dark,bg = COLORS[color]
    jacket_style = f'--mid:{mid};--light:{light};--dark:{dark}'
    # Original vector mannequin illustration: no photograph or third party asset used.
    s = f'''
    <g style="{jacket_style}" transform="translate({offset},0)">
      <path d="M380 738L364 1074L444 1074L480 835L511 1074L590 1074L577 736Z" fill="url(#trouser)"/>
      <path d="M475 738L475 1010" stroke="{dark}" stroke-opacity=".4" stroke-width="3"/>
      <path d="M374 1054L361 1090L444 1090L446 1055ZM508 1055L507 1090L595 1090L587 1055Z" fill="#44403c"/>
      <path d="M427 185L429 257L520 257L518 185" fill="#b78d77"/>
      <ellipse cx="474" cy="125" rx="69" ry="91" fill="#c89e86"/>
      <path d="M405 126Q401 35 466 29Q539 31 542 103Q529 90 513 68Q456 99 407 91Z" fill="#514a43"/>
      <path d="M426 150Q475 167 518 149" stroke="#8e6453" stroke-opacity=".38" stroke-width="2" fill="none"/>
      <path d="M428 233L470 282L519 232L580 270L570 755L383 755L370 273Z" fill="#f2f0ea"/>
      <path d="M475 278L460 314L473 351L455 562L477 596L496 562L483 350L497 315Z" fill="#77756e"/>
      <path d="M425 230L364 255Q328 264 310 315L259 579Q252 624 284 632L320 635L375 455L381 749L479 753L465 380Z" fill="url(#suit)"/>
      <path d="M518 231L579 252Q626 270 645 323L690 577Q700 625 672 637L637 636L578 452L575 755L478 753L488 379Z" fill="url(#suit)"/>
      <path d="M424 233L480 380L451 434L372 280Z" fill="{light}" stroke="{mid}" stroke-width="2"/>
      <path d="M521 232L481 381L512 435L579 275Z" fill="{light}" stroke="{mid}" stroke-width="2"/>
      <path d="M379 290L405 377L386 417L468 594L479 380" fill="none" stroke="{dark}" stroke-opacity=".6" stroke-width="3"/>
      <path d="M575 289L552 376L565 413L485 594" fill="none" stroke="{dark}" stroke-opacity=".55" stroke-width="3"/>
      <path d="M371 479L333 598L299 593M583 478L623 594L657 589" fill="none" stroke="{dark}" stroke-width="3" stroke-opacity=".25"/>
      <path d="M392 594L429 600L431 655L390 649ZM531 600L570 596L570 649L527 657Z" fill="none" stroke="{dark}" stroke-opacity=".5" stroke-width="3"/>
      <path d="M474 604L480 604" stroke="#443f36" stroke-width="10" stroke-linecap="round"/>
      <path d="M462 725L492 725" stroke="{dark}" stroke-opacity=".4" stroke-width="2"/>
      <path d="M288 618Q284 658 306 668Q332 672 343 635L322 611ZM651 614Q662 655 681 657Q709 653 699 619L674 600Z" fill="#bd947c"/>
    </g>'''
    return wrap(s,bg, 'suit').replace('var(--light,#bdb9b2)', light).replace('var(--mid,#999)', mid).replace('var(--dark,#666)', dark).replace('var(--dark,#777)', dark).replace('var(--mid,#999)', mid)

for color in COLORS:
 (ROOT / f'suit-{color}.svg').write_text(suit(color),encoding='utf8')

def shirt():
 s='''<g><path d="M432 169L432 262L521 262L521 170" fill="#bd967e"/>
 <ellipse cx="476" cy="127" rx="64" ry="90" fill="#c89e86"/><path d="M410 115Q405 38 470 28Q538 40 536 109Q521 91 510 70Q460 92 410 90Z" fill="#514b45"/>
 <path d="M435 227L472 281L519 228L582 246L624 364L591 774L370 774L340 365L375 249Z" fill="#47657e"/>
 <path d="M375 252Q326 265 313 320L270 602L327 610L380 444ZM580 250Q635 260 646 319L688 596L628 610L571 442Z" fill="#385672"/>
 <path d="M431 227L474 284L454 328L400 238ZM520 225L475 285L495 328L555 239Z" fill="#e6e7e3"/>
 <path d="M474 284L473 775" stroke="#263f53" stroke-width="3"/>
 <g fill="#e1dace"><circle cx="478" cy="346" r="4"/><circle cx="478" cy="419" r="4"/><circle cx="478" cy="490" r="4"/><circle cx="478" cy="561" r="4"/><circle cx="478" cy="632" r="4"/></g>
 <path d="M371 776L368 1083L446 1083L478 851L509 1083L590 1083L578 775Z" fill="#d8d4c8"/>
 <path d="M366 1076L358 1099L447 1099L449 1076M508 1076L505 1099L592 1099L590 1076" fill="#63564a"/>
 </g>'''
 return wrap(s,'#dededc','shirt')
(ROOT/'shirt-blue.svg').write_text(shirt(),encoding='utf8')

def trousers():
 s='''<path d="M341 164L560 164L611 1009L508 1010L455 416L412 1010L310 1008Z" fill="#d5cfbf"/>
 <path d="M453 181L458 412" stroke="#a8a191" stroke-width="3"/><path d="M338 196Q452 230 566 194" fill="none" stroke="#b3ac9d" stroke-width="5"/>
 <path d="M340 171L558 171" stroke="#eee6d9" stroke-width="17"/><path d="M355 1002L411 1002M519 1002L593 1002" stroke="#b8b0a2" stroke-width="8"/>
 <path d="M312 992L299 1042Q340 1064 413 1034L415 992ZM509 990L507 1032Q556 1067 622 1043L595 990Z" fill="#655b50"/>'''
 return wrap(s,'#dfdfdc','trousers')
(ROOT/'trousers-cream.svg').write_text(trousers(),encoding='utf8')

def shoes():
 s='''<ellipse cx="436" cy="837" rx="280" ry="48" fill="#444" opacity=".16"/>
 <g transform="rotate(-8 450 600)"><path d="M222 628Q290 544 445 563L520 628Q575 676 694 696Q746 705 742 769Q720 810 628 816L198 814Q166 809 163 759Q159 704 222 628Z" fill="#47352d"/>
 <path d="M220 655Q354 599 461 619L512 686Q617 728 733 742" fill="none" stroke="#82614f" stroke-width="11"/>
 <path d="M177 778Q461 824 734 781" fill="none" stroke="#211c1a" stroke-width="19"/>
 <path d="M332 650L446 682L503 729" stroke="#bb9079" stroke-width="8" fill="none"/>
 <path d="M412 698Q432 748 450 750M448 703Q465 752 484 751" stroke="#ad886f" stroke-width="8" fill="none"/>
 </g>'''
 return wrap(s,'#e4e3e0','shoes')
(ROOT/'shoes-brown.svg').write_text(shoes(),encoding='utf8')

def knit():
 s='''<g><path d="M415 140L425 230L520 230L523 140" fill="#b98d71"/><ellipse cx="473" cy="116" rx="65" ry="84" fill="#c99d82"/>
 <path d="M411 116Q401 36 460 30Q535 33 540 102Q518 87 516 67Q446 96 413 90Z" fill="#594d47"/>
 <path d="M425 215Q474 265 520 213L587 235L603 763L363 763L368 240Z" fill="#d7d0c2"/>
 <path d="M367 243Q323 258 308 320L268 614L325 631L378 438ZM585 242Q630 252 648 320L686 612L626 633L579 440Z" fill="#c7bfaf"/>
 <path d="M426 220Q470 279 519 219" fill="none" stroke="#a49c90" stroke-width="14"/>
 <path d="M367 752L578 752L592 1081L507 1081L475 841L449 1081L365 1081Z" fill="#676965"/>
 <path d="M363 1078L356 1102L450 1102L451 1078M508 1078L504 1102L596 1102L592 1078" fill="#383432"/>
 </g>'''
 return wrap(s,'#deded9','knitwear')
(ROOT/'knit-cream.svg').write_text(knit(),encoding='utf8')

def tie():
 s='''<path d="M428 171L475 124L522 170L495 257L518 749L466 847L431 744L455 258Z" fill="#30435c"/>
 <path d="M428 171L475 124L522 170L493 247L455 247Z" fill="#57708b"/>
 <path d="M454 271L490 271M454 320L493 320M457 370L495 370M459 420L498 420M463 470L502 470M463 520L507 520M465 570L509 570" stroke="#a1aeba" stroke-width="5" stroke-opacity=".38"/>
 <path d="M466 847L518 749L431 744Z" fill="#1b2b40"/>'''
 return wrap(s,'#e4e4e1','tie')
(ROOT/'tie-navy.svg').write_text(tie(),encoding='utf8')

# Full-bleed editorial illustration: abstract architecture and 2 cropped tailored figures.
hero='''<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1050" viewBox="0 0 1800 1050" aria-label="Aura BOED editorial campaign placeholder">
<defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#d1cdc5"/><stop offset=".65" stop-color="#a9a9a5"/><stop offset="1" stop-color="#777e82"/></linearGradient>
<linearGradient id="j" x1="0" x2="1"><stop stop-color="#74695d"/><stop offset=".5" stop-color="#c4b8a8"/><stop offset="1" stop-color="#756c60"/></linearGradient>
<linearGradient id="k" x1="0" x2="1"><stop stop-color="#293a48"/><stop offset=".5" stop-color="#6b8292"/><stop offset="1" stop-color="#233745"/></linearGradient>
<linearGradient id="fade" x1="0" x2="1"><stop stop-color="#1b262b" stop-opacity=".58"/><stop offset=".52" stop-color="#263339" stop-opacity=".15"/><stop offset="1" stop-color="#18232a" stop-opacity=".05"/></linearGradient></defs>
<rect width="1800" height="1050" fill="url(#g)"/><path d="M0 0H470L380 1050H0ZM1445 0H1800V1050H1620Z" fill="#e5e0d9" opacity=".37"/>
<path d="M730 0V1050M1430 0V1050" stroke="#f1efeb" stroke-opacity=".4" stroke-width="4"/>
<g transform="translate(790,3) scale(1.13)"><path d="M139 519L130 925L280 925L327 620L373 925L508 925L500 519Z" fill="#444842"/>
<path d="M259 120L267 183L363 184L364 120" fill="#b18b76"/><ellipse cx="312" cy="61" rx="63" ry="83" fill="#bc977e"/><path d="M248 63Q250 -10 304 -10Q376 -10 376 68L353 15L250 32" fill="#4c4845"/>
<path d="M256 176L312 265L367 174L435 199L438 663L184 663L190 196Z" fill="#eee9de"/>
<path d="M264 181L158 221L105 357L83 574L152 595L204 430L193 664L318 660L294 310Z" fill="url(#j)"/>
<path d="M366 182L462 218L509 346L568 550L500 573L430 419L439 667L315 662L330 311Z" fill="url(#j)"/>
<path d="M266 180L316 316L280 387L182 216Z" fill="#d0c6b9"/><path d="M369 180L315 319L355 388L457 216Z" fill="#c2b8aa"/>
<path d="M309 325L313 562" stroke="#696457" stroke-width="4"/></g>
<g transform="translate(1322,185) scale(.95)"><path d="M138 523L126 910L268 910L312 618L353 911L491 911L491 524Z" fill="#303338"/>
<ellipse cx="303" cy="74" rx="64" ry="83" fill="#bc957f"/><path d="M240 71Q245 -11 309 -5Q380 -3 370 70L349 17L246 40" fill="#302c2b"/>
<path d="M265 176L309 283L355 176L445 202L436 659L178 658L183 204Z" fill="#efeee9"/>
<path d="M259 184L160 220L107 347L75 572L151 578L199 424L181 650L318 656L299 326Z" fill="url(#k)"/>
<path d="M356 184L458 218L505 336L559 544L484 575L434 426L446 651L309 656L322 325Z" fill="url(#k)"/>
<path d="M264 176L319 326L280 389L178 217Z" fill="#5a7384"/><path d="M356 175L318 327L357 390L458 218Z" fill="#496477"/></g>
<rect width="1800" height="1050" fill="url(#fade)"/></svg>'''
(ROOT/'hero-editorial.svg').write_text(hero,encoding='utf8')

# Wide campaign banner for mid-page editorial.
wide='''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1700 650" width="1700" height="650">
<defs><linearGradient id="a" x2="1" y2=".3"><stop stop-color="#6e756d"/><stop offset="1" stop-color="#b3b4a5"/></linearGradient></defs>
<rect width="1700" height="650" fill="url(#a)"/><path d="M0 0H370L500 650H0Z" fill="#525f57" opacity=".4"/>
<path d="M1050 0L850 650H1060L1270 0Z" fill="#d2d2c6" opacity=".35"/>
<g transform="translate(1090,-100) scale(.78)"><ellipse cx="300" cy="117" rx="70" ry="94" fill="#bc947e"/>
<path d="M235 106Q236 14 309 16Q378 23 369 110L348 65L241 71" fill="#34363a"/>
<path d="M246 223L170 250L109 410L85 750L212 755L228 448L234 885L423 886L433 450L458 756L585 750L525 399L472 250L382 222Z" fill="#2d414f"/>
<path d="M246 223L321 368L290 448L170 250Z" fill="#72808a"/><path d="M381 221L318 370L360 453L474 251Z" fill="#607682"/>
<path d="M275 221L315 297L356 221L339 330L315 375L293 333Z" fill="#f1efea"/></g>
</svg>'''
(ROOT/'story-banner.svg').write_text(wide,encoding='utf8')
print('Generated', len(list(ROOT.glob('*.svg'))), 'SVG illustrations')
