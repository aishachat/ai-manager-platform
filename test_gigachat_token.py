import requests
import os
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv('.env.local')

def test_gigachat_token():
    url = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
    
    # Получаем Authorization key из переменных окружения
    auth_key = os.getenv('GIGACHAT_API_KEY')
    
    if not auth_key:
        print("❌ GIGACHAT_API_KEY не найден в переменных окружения")
        return False
    
    print(f"✅ Authorization key найден: {auth_key[:20]}...")
    
    payload = {
        'scope': 'GIGACHAT_API_PERS'
    }
    
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'RqUID': 'ac160d04-0557-4dc0-bc66-8e7875d69102',
        'Authorization': f'Basic {auth_key}'
    }
    
    print("Отправляем запрос к GigaChat OAuth...")
    print(f"URL: {url}")
    print(f"Headers: {headers}")
    
    try:
        response = requests.post(url, headers=headers, data=payload, timeout=30)
        
        print(f"✅ Статус ответа: {response.status_code}")
        print(f"Ответ: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if 'access_token' in data:
                print(f"✅ Токен получен успешно!")
                print(f"Access Token (первые 50 символов): {data['access_token'][:50]}...")
                print(f"Expires at: {data.get('expires_at')}")
                return data['access_token']
            else:
                print("❌ Токен не найден в ответе")
                return False
        else:
            print(f"❌ Ошибка: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Ошибка запроса: {e}")
        return False

if __name__ == "__main__":
    print("=== ТЕСТ ПОЛУЧЕНИЯ ТОКЕНА GIGACHAT (Python) ===")
    token = test_gigachat_token()
    
    if token:
        print("🎉 Тест завершен успешно!")
    else:
        print("💥 Тест завершен с ошибкой!")

