from flask import Flask, render_template, request, jsonify, redirect, url_for
import os
import shutil

app = Flask(__name__)
UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def gallery():
    images = os.listdir(UPLOAD_FOLDER)
    return render_template('gallery.html', images=images)

@app.route('/upload', methods=['POST'])
def upload_images():
    files = request.files.getlist('images')
    for f in files:
        if f.filename:
            f.save(os.path.join(UPLOAD_FOLDER, f.filename))
    return redirect(url_for('gallery'))

@app.route('/save_selection', methods=['POST'])
def save_selection():
    selected = request.json.get('selected', [])
    with open('selected_images.txt', 'w', encoding='utf-8') as f:
        f.write('\n'.join(selected))
    return jsonify({'message': 'נשמר בהצלחה!'})

@app.route('/clear_gallery', methods=['POST'])
def clear_gallery():
    # מוחק את כל הקבצים בתיקייה
    folder = UPLOAD_FOLDER
    for filename in os.listdir(folder):
        file_path = os.path.join(folder, filename)
        if os.path.isfile(file_path):
            os.remove(file_path)
    return jsonify({'message': 'הגלריה נוקתה בהצלחה!'})

if __name__ == '__main__':
    app.run(debug=True)
