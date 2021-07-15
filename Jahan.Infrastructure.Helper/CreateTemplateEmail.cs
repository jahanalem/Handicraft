using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Jahan.Infrastructure.Helper
{
    public class CreateTemplateEmail
    {
        private IDictionary<string, string> _templates;

        private CreateTemplateEmail()
        {
            _templates = new Dictionary<string, string>(4);
        }

        private static CreateTemplateEmail _Instance;
        public static CreateTemplateEmail Instance
        {
            get
            {
                if (_Instance == null) _Instance = new CreateTemplateEmail();
                return _Instance;
            }
        }

        public string GetTemplate(string filePath)
        {
            if (_templates.Keys.Contains(filePath))
                if (!string.IsNullOrEmpty(_templates[filePath])) return _templates[filePath];

            string line;
            string totalLines = "";
            if (System.IO.File.Exists(filePath))
            {
                try
                {
                    using (StreamReader file = new StreamReader(filePath))
                    {
                        while ((line = file.ReadLine()) != null)
                        {
                            totalLines += line;
                        }
                    }

                    if (_templates.Keys.Contains(filePath)) _templates[filePath] = totalLines.Trim();
                    else _templates.Add(filePath, totalLines.Trim());
                }
                catch (FileNotFoundException)
                {
                    if (_templates.Keys.Contains(filePath)) _templates[filePath] = null;
                    else _templates.Add(filePath, string.Empty);
                }
            }
            return _templates[filePath];
        }
    }
}
