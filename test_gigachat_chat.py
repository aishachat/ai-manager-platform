import requests
import os
import json
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv('.env.local')

def get_gigachat_token():
    url = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
    
    auth_key = os.getenv('GIGACHAT_API_KEY')
    
    if not auth_key:
        print("❌ GIGACHAT_API_KEY не найден")
        return None
    
    payload = {
        'scope': 'GIGACHAT_API_PERS'
    }
    
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'RqUID': 'ac160d04-0557-4dc0-bc66-8e7875d69102',
        'Authorization': f'Basic {auth_key}'
    }
    
    try:
        response = requests.post(url, headers=headers, data=payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            return data.get('access_token')
        else:
            print(f"❌ Ошибка получения токена: {response.status_code}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Ошибка запроса токена: {e}")
        return None

def test_gigachat_chat():
    print("=== ТЕСТ ЧАТА С GIGACHAT (Python) ===")
    
    # Получаем токен
    token = get_gigachat_token()
    
    if not token:
        print("❌ Не удалось получить токен")
        return False
    
    print(f"✅ Токен получен: {token[:50]}...")
    
    # Тестируем запрос к моделям
    url = "https://gigachat.devices.sberbank.ru/api/v1/models"
    
    headers = {
        'Accept': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    print("Тестируем запрос к моделям...")
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        
        print(f"✅ Статус ответа: {response.status_code}")
        print(f"Ответ: {response.text}")
        
        if response.status_code == 200:
            print("✅ Запрос к моделям успешен!")
            
            # Тестируем чат
            chat_url = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions"
            
            payload = {
                "model": "GigaChat-2-Pro",
                "messages": [
                    {
                        "role": "user",
                        "content": "Привет! Ответь одним словом: \"Работает\""
                    }
                ],
                "temperature": 0.7,
                "max_tokens": 100
            }
            
            headers = {
                'Accept': 'application/json',
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
            
            print("Тестируем чат...")
            
            response = requests.post(chat_url, headers=headers, json=payload, timeout=30)
            
            print(f"✅ Статус ответа чата: {response.status_code}")
            print(f"Ответ чата: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                if 'choices' in data and len(data['choices']) > 0:
                    message = data['choices'][0].get('message', {}).get('content', '')
                    print(f"✅ Ответ GigaChat: {message}")
                    return True
                else:
                    print("❌ Неожиданный формат ответа чата")
                    return False
            else:
                print(f"❌ Ошибка чата: {response.status_code}")
                return False
        else:
            print(f"❌ Ошибка запроса к моделям: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Ошибка запроса: {e}")
        return False

if __name__ == "__main__":
    success = test_gigachat_chat()
    
    if success:
        print("🎉 Тест чата завершен успешно!")
    else:
        print("💥 Тест чата завершен с ошибкой!")

