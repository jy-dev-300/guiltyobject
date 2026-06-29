# Video Background Removal Commands

These commands use the fresh upstream repo in `external\VideoBackgroundRemoval-upstream`
through its `poetry` environment and keep the default `yolov7` tracker path.

## White Mirror

```powershell
C:\Users\jsy30\guiltyobbj\.venv-vbr-clean\Scripts\poetry.exe run python main.py `
  --video_filename "C:\Users\jsy30\guiltyobbj\videos\white mirror mp4.mp4" `
  --dir_frames "C:\Users\jsy30\guiltyobbj\tmp\white_frames_upstream" `
  --bbox_file "C:\Users\jsy30\guiltyobbj\external\VideoBackgroundRemoval-upstream\bbox_mirror_default.txt" `
  --output_dir "C:\Users\jsy30\guiltyobbj\tmp\white_output_upstream" `
  --output_video "C:\Users\jsy30\guiltyobbj\videos\white whitebg fixed upstream.mp4" `
  --background_color "#FFFFFF"
```

## Nude Enamel Mirror

```powershell
C:\Users\jsy30\guiltyobbj\.venv-vbr-clean\Scripts\poetry.exe run python main.py `
  --video_filename "C:\Users\jsy30\guiltyobbj\videos\nude enamel mirror mp4.mp4" `
  --dir_frames "C:\Users\jsy30\guiltyobbj\tmp\nude_frames_upstream" `
  --bbox_file "C:\Users\jsy30\guiltyobbj\external\VideoBackgroundRemoval-upstream\bbox_mirror_default.txt" `
  --output_dir "C:\Users\jsy30\guiltyobbj\tmp\nude_output_upstream" `
  --output_video "C:\Users\jsy30\guiltyobbj\videos\nude enamel mirror whitebg fixed upstream.mp4" `
  --background_color "#FFFFFF"
```

## Light Grey Enamel Mirror

```powershell
C:\Users\jsy30\guiltyobbj\.venv-vbr-clean\Scripts\poetry.exe run python main.py `
  --video_filename "C:\Users\jsy30\guiltyobbj\videos\light grey enamel mirror mp4.mp4" `
  --dir_frames "C:\Users\jsy30\guiltyobbj\tmp\lightgrey_frames_upstream" `
  --bbox_file "C:\Users\jsy30\guiltyobbj\external\VideoBackgroundRemoval-upstream\bbox_mirror_default.txt" `
  --output_dir "C:\Users\jsy30\guiltyobbj\tmp\lightgrey_output_upstream" `
  --output_video "C:\Users\jsy30\guiltyobbj\videos\light grey enamel mirror whitebg fixed upstream.mp4" `
  --background_color "#FFFFFF"
```

## Black Enamel Mirror

```powershell
C:\Users\jsy30\guiltyobbj\.venv-vbr-clean\Scripts\poetry.exe run python main.py `
  --video_filename "C:\Users\jsy30\guiltyobbj\videos\black enamel mirror mp4.mp4" `
  --dir_frames "C:\Users\jsy30\guiltyobbj\tmp\black_frames_upstream" `
  --bbox_file "C:\Users\jsy30\guiltyobbj\external\VideoBackgroundRemoval-upstream\bbox_mirror_default.txt" `
  --output_dir "C:\Users\jsy30\guiltyobbj\tmp\black_output_upstream" `
  --output_video "C:\Users\jsy30\guiltyobbj\videos\black enamel mirror whitebg fixed upstream.mp4" `
  --background_color "#FFFFFF"
```

## Dark Red Enamel

```powershell
C:\Users\jsy30\guiltyobbj\.venv-vbr-clean\Scripts\poetry.exe run python main.py `
  --video_filename "C:\Users\jsy30\guiltyobbj\videos\dark red enamel mp4.mp4" `
  --dir_frames "C:\Users\jsy30\guiltyobbj\tmp\darkred_frames_upstream" `
  --bbox_file "C:\Users\jsy30\guiltyobbj\external\VideoBackgroundRemoval-upstream\bbox_mirror_default.txt" `
  --output_dir "C:\Users\jsy30\guiltyobbj\tmp\darkred_output_upstream" `
  --output_video "C:\Users\jsy30\guiltyobbj\videos\dark red enamel whitebg fixed upstream.mp4" `
  --background_color "#FFFFFF"
```
