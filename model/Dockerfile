FROM wparam/acamera_model_deck

WORKDIR /app
COPY . /app

# RUN pip install -r requirements.txt
RUN pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt

EXPOSE 3001
CMD [ "python", "./api.py" ]
