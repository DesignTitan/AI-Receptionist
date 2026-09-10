"""Run in Higgsfield sandbox with sources.json; export MP4 before sandbox exits."""
from pathlib import Path
import json,subprocess,io
from PIL import Image,ImageDraw,ImageFont
p=Path('/home/user/happy-paws');p.mkdir(exist_ok=True)
sources=json.loads(Path('/home/user/sources.json').read_text())
def run(args):
 subprocess.run(args,check=True)
def ff(args):
 run(['ffmpeg','-hide_banner','-loglevel','error','-y','-threads','2']+args)
for name,url in sources.items():
 run(['curl','-fsSL',url,'-o',str(p/(name+'.mp4'))])
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
# Clean translucent speech graphics, generated separately from footage.
for name,title,lines in [('greet','HAPPY PAWS',['Hi. How can','I help?']),('time','AI RECEPTIONIST',['Thursday works.','2:00 PM']),('booked','APPOINTMENT BOOKED',['Milo','Thursday · 2 PM'])]:
 im=Image.new('RGBA',(330,210));d=ImageDraw.Draw(im)
 d.rounded_rectangle((1,1,328,208),radius=26,fill=(248,255,251,223),outline=(255,255,255,245),width=2)
 d.text((23,24),title,font=ImageFont.truetype(font,16),fill='#32574a')
 for i,line in enumerate(lines):d.text((23,76+i*45),line,font=ImageFont.truetype(font,27),fill='#1e3a34')
 im.save(p/(name+'.png'))
enc=['-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-r','24','-c:a','aac','-b:a','192k','-ar','48000','-ac','2']
for name,num in [('opening','01'),('caller','03'),('accept','05')]:
 ff(['-i',str(p/(name+'.mp4')),'-vf','scale=1920:1080,setsar=1,fps=24','-af','loudnorm=I=-16:TP=-1.5:LRA=11']+enc+[str(p/(num+'.mp4'))])
# Greeting starts with occupied hands and glance at ringing phone, then AI answers.
ff(['-i',str(p/'glance.mp4'),'-i',str(p/'opening.mp4'),'-filter_complex','[0:v]trim=0:2,setpts=PTS-STARTPTS,scale=1920:1080,setsar=1,fps=24[a];[1:v]trim=0:8,setpts=PTS-STARTPTS,scale=1920:1080,setsar=1,fps=24[b];[a][b]concat=n=2:v=1:a=0[v]','-map','[v]','-an','-c:v','libx264','-preset','veryfast','-crf','19',str(p/'greeting-base.mp4')])
for puppet,base,card,num,delay,duration in [('puppet-greet','greeting-base','greet','02',2,10),('puppet-time','opening','time','04',0,9),('puppet-booked','drying','booked','06',0,9)]:
 # Key actual rendered backdrop; hue may differ from requested magenta.
 png=subprocess.check_output(['ffmpeg','-v','error','-i',str(p/(puppet+'.mp4')),'-frames:v','1','-f','image2pipe','-vcodec','png','-'])
 im=Image.open(io.BytesIO(png)).convert('RGB');rgb=im.getpixel((20,20));key='0x'+''.join(f'{v:02x}' for v in rgb)
 print('KEY',puppet,key,flush=True)
 graph=f'[0:v]scale=1920:1080,setsar=1,fps=24,trim=duration={duration},setpts=PTS-STARTPTS[bg];[1:v]fps=24,format=rgba,colorkey={key}:0.13:0.035,scale=600:600,fade=t=in:st=0:d=0.25:alpha=1,setpts=PTS-STARTPTS+{delay}/TB[m];[bg][m]overlay=x=1100:y=350:eof_action=pass:enable=gte(t\\,{delay})[v1];[v1][2:v]overlay=1510:680:enable=gte(t\\,{delay+0.35})[v];[1:a]adelay={delay*1000}|{delay*1000},apad,loudnorm=I=-16:TP=-1.5:LRA=11[a]'
 ff(['-i',str(p/(base+'.mp4')),'-i',str(p/(puppet+'.mp4')),'-loop','1','-i',str(p/(card+'.png')),'-filter_complex_threads','1','-filter_complex',graph,'-map','[v]','-map','[a]','-t',str(duration)]+enc+[str(p/(num+'.mp4'))])
endfilter="scale=1920:1080,setsar=1,fps=24,drawbox=x=1180:y=735:w=695:h=270:color=0x102c22@0.55:t=fill:enable='gte(t,11)',drawtext=fontfile="+font+":text='Take your day back.':x=1210:y=765:fontsize=48:fontcolor=white:enable='gte(t,11)',drawtext=fontfile="+font+":text='Meet your AI receptionist':x=1210:y=845:fontsize=30:fontcolor=white:enable='gte(t,11)',drawtext=fontfile="+font+":text='Incoming booking requires a connected pilot.':x=1210:y=940:fontsize=20:fontcolor=white:enable='gte(t,11)'"
ff(['-i',str(p/'ending.mp4'),'-vf',endfilter,'-af','loudnorm=I=-16:TP=-1.5:LRA=11']+enc+[str(p/'07.mp4')])
(p/'list.txt').write_text(''.join(f"file '{p}/{n:02}.mp4'\n" for n in range(1,8)))
ff(['-f','concat','-safe','0','-i',str(p/'list.txt'),'-c','copy','-movflags','+faststart',str(p/'happy-paws-first-cut.mp4')])
print(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration,size','-of','json',str(p/'happy-paws-first-cut.mp4')]).decode(),flush=True)
