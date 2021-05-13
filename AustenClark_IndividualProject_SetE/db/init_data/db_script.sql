CREATE DATABASE food_db;
DROP TABLE IF EXISTS food_reviews CASCADE;
CREATE TABLE IF NOT EXISTS food_reviews (
  food_name VARCHAR(30),
  food_review VARCHAR(200),
  review_date VARCHAR(50)
);

INSERT INTO food_reviews(food_name, food_review, review_date)
VALUES('Chicken tenders', 'Tastes like chicken which is a good thing!', 'Fri Apr 27 2021 11:05 MST');