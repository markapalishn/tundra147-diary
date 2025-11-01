#!/bin/bash

# Скрипт для публикации проекта на GitHub Pages
# Использование: ./deploy.sh <имя-репозитория> <ваш-github-username>

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Использование: ./deploy.sh <имя-репозитория> <ваш-github-username>"
    echo "Пример: ./deploy.sh tundra147-diary apalishin"
    exit 1
fi

REPO_NAME=$1
GITHUB_USER=$2

echo "🚀 Настройка репозитория для GitHub Pages..."

# Добавляем remote
git remote remove origin 2>/dev/null
git remote add origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

# Переименовываем ветку в main (если нужно)
git branch -M main

echo "📤 Отправка кода на GitHub..."
git push -u origin main

echo "✅ Код отправлен!"
echo ""
echo "📝 Следующие шаги:"
echo "1. Откройте https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo "2. Перейдите в Settings > Pages"
echo "3. В разделе 'Source' выберите 'Deploy from a branch'"
echo "4. Выберите branch: 'main' и folder: '/ (root)'"
echo "5. Нажмите Save"
echo "6. Ваш сайт будет доступен по адресу: https://${GITHUB_USER}.github.io/${REPO_NAME}/"
echo ""
echo "⏳ GitHub Pages обычно публикуется за 1-2 минуты"

