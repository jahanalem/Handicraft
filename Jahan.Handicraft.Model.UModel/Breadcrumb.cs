using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.WebPages;
using Umbraco.Core.Models;

namespace Jahan.Handicraft.Model.UModel
{
    public class Breadcrumb : BaseEntity
    {
        public static string CurrentTitle { get; set; }
        public string Link { get; set; }
        public string Title { get; set; }

        public override void Initialize(IPublishedContent content, CultureInfo culture)
        {

        }

        public static List<Breadcrumb> Get(IPublishedContent content, CultureInfo culture)
        {
            CurrentTitle = content.Name;
            List<Breadcrumb> breadcrumbList = new List<Breadcrumb>();
            var url = content.Url; // /cakes/fruit-cake/
            string[] urlSplited = url.Split('/');
            string salt = "/";
            foreach (var s in urlSplited)
            {
                if(s.IsEmpty())
                    continue;
                Breadcrumb bc = new Breadcrumb();
                bc.Title = s;
                salt += string.Format("{0}/", s);
                bc.Link = salt;
                breadcrumbList.Add(bc);
            }
            return breadcrumbList;
        }
    }
}
