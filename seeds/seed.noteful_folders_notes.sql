INSERT INTO folders (folder_name)
    VALUES
    ('recipes'), 
    ('face products'), 
    ('skincare routine'), 
    ('health');

INSERT INTO notes (note_name, modified, folder_id, content)
    VALUES
    ('Banh Nuoc Trung', '2019-01-03T00:00:00.000Z', 1, 'This recipe is yummy'),
    ('Collagen Serum', '2019-02-04T00:00:00.000Z', 2, 'Greate for your face'),
    ('Abs Workout', '2018-10-20T00:00:00.000Z', 4, 'Note 3'),
    ('Chicken wings', '2019-12-27T00:00:00.000Z', 1, 'Delicious sticky wings'),
    ('Face masks', '2020-01-20T00:00:00.000Z', 2, 'Great for anti-aging'),
    ('Green Juice', '2019-05-18T00:00:00.000Z', 4, 'Cleansing juice diet');